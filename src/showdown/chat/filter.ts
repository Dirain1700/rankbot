"use strict";

import type { Room, Message } from "@dirain/client";

const STRETCH_LIMIT = 10;

export default function (message: Message<Room>): void {
    if (!Config.enableStretchFilter.includes(message.target.id)) return;
    /* eslint-disable no-useless-escape */
    if (message.target.isStaff(message.author) || /[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}]/mu.test(message.content)) return;
    if (/^[^A-Za-z0-9]/.test(message.content.charAt(0))) return;
    const stretchRegex: RegExp = new RegExp(`(.)\\1{${STRETCH_LIMIT - 1},}`, "gimsu");
    const wordStretchRegex: RegExp = new RegExp(`(\S+?)${"\\1".repeat(STRETCH_LIMIT - 1)}`, "gimsu");
    /* eslint-enable */

    const stretchFilter: (str: string) => boolean = (str: string) => {
        const result = str.match(stretchRegex);
        if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(STRETCH_LIMIT));
        else return false;
    };

    const wordStretchFilter: (str: string) => boolean = (str: string) => {
        const result = str.match(wordStretchRegex);
        if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(STRETCH_LIMIT));
        else return false;
    };

    const wordStretchWithBlankFilter: (str: string) => boolean = (str: string) => {
        let hasStretchSentence: boolean = false;
        for (const sentence of str.split(". ")) {
            const arr = sentence.split(" ");
            let latestWord = "";
            const set = new Set();
            const duplicatedWords: { [word: string]: number } = {};
            let i = 1;
            let count = 0;

            for (const word of arr) {
                set.add(word);
                if (latestWord === word) count++;
                else if (set.size !== arr.length) {
                    duplicatedWords[word] ? duplicatedWords[word]++ : (duplicatedWords[word] = 1);
                    arr.slice(i);
                    i--;
                }

                latestWord = word;
                i++;
            }
            if (count > 3) hasStretchSentence = true;
            else if (Object.values(duplicatedWords).filter((e) => e > STRETCH_LIMIT).length) hasStretchSentence = true;
        }
        return hasStretchSentence;
    };

    let content: string = "Bot moderation: this message have been by ";

    if (stretchFilter(message.content)) content += "stretchFilter";
    else if (wordStretchFilter(message.content)) content += "wordStretchFilter" + message.content;
    else if (wordStretchWithBlankFilter(message.content)) content += "wordStretchFilter" + message.content;
    else return;
    content += ": " + message.content;
    message.target.modnote(content);
}
