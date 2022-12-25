"use strict";

import type { Room, Message } from "@dirain/client";
import type { GuildTextBasedChannel } from "discord.js";

export default (message: Message<Room>): void => {
    if (message.target.isStaff(message.author) || /[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}]/mu.test(message.content)) return;
    if (["!", "/"].includes(message.content.charAt(0))) return;
    const stretchRegex: RegExp = /(.)\1{4,}/gimsu;
    const wordStretchRegex: RegExp = /(\S+?)\1+\1+\1+\1+/gimsu;

    const stretchFilter: (str: string) => boolean = (str: string) => {
        const result = str.match(stretchRegex);
        if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(5));
        else return false;
    };

    const wordStretchFilter: (str: string) => boolean = (str: string) => {
        const result = str.match(wordStretchRegex);
        if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(5));
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
            else if (Object.values(duplicatedWords).filter((e) => e >= 6).length) hasStretchSentence = true;
        }
        return hasStretchSentence;
    };

    if (stretchFilter(message.content))
        return void (discord.channels.cache.get(config.testCh) as GuildTextBasedChannel)?.send?.({
            content: "Caught by stretchFilter: " + message.content,
        });

    let content: string = "Caught by ";

    if (stretchFilter(message.content)) content += "stretchFilter: " + message.content;
    else if (wordStretchFilter(message.content)) content += "wordStretchFilter: " + message.content;
    else if (wordStretchWithBlankFilter(message.content)) content += "wordStretchFilter: " + message.content;
    else if (noMeaningFilter(message.content)) content += "noMeaningFilter: " + message.content;
    else return;
    message.reply(content);
    (discord.channels.cache.get(config.testCh) as GuildTextBasedChannel)?.send?.(content);
};
