"use strict";

import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (message.author.userid !== config.owner || !message.isNotUnknown()) return;
    const targetFilePath = message.content.substring(8).trim();

    if (!fs.existsSync(targetFilePath)) return void message.reply("Module not found. Check spelling?");

    const result = fs.readFileSync(targetFilePath, "utf-8");
    message.reply("!code " + result);
};
