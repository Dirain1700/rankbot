"use strict";

import type { Room, Message } from "@dirain/client";
import type { GuildTextBasedChannel } from "discord.js";

export default (message: Message<Room>): void => {
    const stretchRegex: RegExp = /(.)\1{4,}/gisu;
    const stretchFilter: (str: string) => boolean = (str: string) => {
        const result = str.match(stretchRegex);
        if (Array.isArray(result)) return !str.toLowerCase().startsWith("w".repeat(5));
        else return false;
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
        if (strings.length === 4 && str.length <= 13) return true;
        if (strings.length === 3 && str.length <= 8) return true;
        if (strings.length === 2 && str.length < 5) return true;
        return false;
    };

    if (stretchFilter(message.content))
        return void (discord.channels.cache.get(config.testCh) as GuildTextBasedChannel)?.send?.({
            content: "Caught by stretchFilter: " + message.content,
        });

    let content: string = "Caught by ";

    if (stretchFilter(message.content)) content += "stretchFilter: " + message.content;

    if (noMeaningFilter(message.content)) content += "noMeaningFilter: " + message.content;

    if (content === "Caught by ") return;
    message.reply(content);
    (discord.channels.cache.get(config.testCh) as GuildTextBasedChannel)?.send?.(content);
};
