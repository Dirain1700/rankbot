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

    const noMeaningFilter: (str: string) => boolean = (str: string) => {
        if (str.length > 16) return false;
        str = str.toLowerCase();
        const strings: string[] = str.split(" ");
        if (/\w/.test(str) && strings.length >= 5) return true;
        // includes Hiragana
        if (/[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}]/mu.test(str)) return false;
        // includes Katakana
        if (/[\u{3000}-\u{301C}\u{30A1}-\u{30F6}\u{30FB}-\u{30FE}]/mu.test(str)) return false;
        // includes Kanji
        if (
            /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)/mu.test(
                str
            )
        )
            return false;
        if (strings.length >= 5) return true;
        if (strings.length === 4 && str.length <= 8) return true;
        if (strings.length === 3 && str.length <= 6) return true;
        if (strings.length === 2 && str.length < 4) return true;
        const set = new Set();
        for (const strs of str.split("")) {
            set.add(strs);
        }
        if (str.split("").length === set.size && str.length >= 13) return true;
        return false;
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