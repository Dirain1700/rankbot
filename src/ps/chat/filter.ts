"use strict";

import type { Room, Message } from "../client/src";

const STRETCH_LIMIT = 10;
/* eslint-disable no-useless-escape */
const stretchRegex: RegExp = new RegExp(`(.)\\1{${STRETCH_LIMIT - 1},}`, "gimsu");
const wordStretchRegex: RegExp = new RegExp(`(\S+?)${"\\1".repeat(STRETCH_LIMIT - 1)}`, "gimsu");
/* eslint-enable */

function stretchFilter(str: string): boolean {
    const result = str.match(stretchRegex);
    if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(STRETCH_LIMIT));
    else return false;
}

function wordStretchFilter(str: string): boolean {
    const result = str.match(wordStretchRegex);
    if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(STRETCH_LIMIT));
    else return false;
}

function wordStretchWithBlankFilter(str: string): boolean {
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
        else if (Object.values(duplicatedWords).some((e) => e > STRETCH_LIMIT)) hasStretchSentence = true;
    }
    return hasStretchSentence;
}

export function stretchDetector(message: Message<Room>): boolean {
    if (!Config.roomSettings[message.target.id]?.["stretchFilter"]) return false;
    if (message.command || message.target.isStaff(message.author) || message.content.length < STRETCH_LIMIT) return false;

    if (!stretchFilter(message.content) && !wordStretchFilter(message.content) && !wordStretchWithBlankFilter(message.content))
        return false;

    if (Config.roomSettings[message.target.id]!["stretchFilter"] === "punish") {
        message.target.mute(message.author, false, "Stretch");
    } else if (Config.roomSettings[message.target.id]!["stretchFilter"] === "hidetext") {
        void message.target.hidetext(message.author.id, true, 1, false, "Stretch");
    } else {
        const content: string = "Bot moderation: this message have been caught by stretch filter.";
        message.target.modnote(content);
    }

    return true;
}

export function checkChat(message: Message<Room>): void {
    if (stretchDetector(message)) return;
}
