"use strict";

import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (message.isRoomMessage()) if (!message.target.isVoice(message.author.id) || !message.author.isGlobalVoice) return;

    const lang = message.content.toLowerCase().substring(6)?.trim() ?? "japanese";

    let url;
    switch (lang) {
        case "japanese":
        case "jp":
            url = "README";
            break;
        case "english":
        case "en":
            url = "README-en";
            break;
        default:
            return void message.reply(`The document file written in language "${lang}" does not exist!`);
    }
    if (!url) return;
    message.reply(`Dirain1700's Guide: https://github.com/Dirain1700/rankbot/blob/main/${url}.md`);
};
