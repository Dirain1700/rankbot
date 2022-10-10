"use strict";

import type { Message, Room } from "@dirain/client";
import type { Channel } from "discord.js";

export default (message: Message<Room>): void => {
    if (message.target.roomid !== "japanese" || !discord.isReady()) return;
    const log = message.content.replace("/log ", "");
    const file = "./config/chatlog.json";
    interface chatLogType {
        content: string;
        user: string;
        time: number;
    }
    const messages: chatLogType[] = JSON.parse(fs.readFileSync(file, "utf-8"));
    let target: chatLogType[] = [];
    const targetChannel: undefined | Channel = discord.channels.cache.get(config.logch);
    if (!targetChannel || !targetChannel.isTextBased()) return;

    if (config.log.some((e) => message.content.includes(e))) {
        target = messages.filter((m) => m.user == Tools.toId(log.split(" was")[0] ?? ""));
    } else if (~message.content.indexOf("'s messages")) {
        target = messages.filter((m) => m.user == Tools.toId(log.split("'s messages")[0] ?? ""));
    } else if (~message.content.indexOf("was promoted")) {
        const targetUser = log.split(" was promoted")[0];
        targetChannel.send(`${log}\nおめでとう、${targetUser}!`);
        return;
    } else if (~message.content.indexOf("was demoted")) {
        return void targetChannel.send(log);
    }

    if (!target.length) return;
    target.sort((a, b) => a.time - b.time);
    const chatLog = target.map((i) => `<t:${i.time}:T> ${i.user}: ${i.content}`);

    targetChannel.send(log + "\n" + chatLog.join("\n"));
};
