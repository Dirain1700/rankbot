"use strict";

import type { Message, Room } from "../client/src";
import type { Channel } from "discord.js";

interface chatLogType {
    user: string;
    content: string;
    time: number;
}

const sortLogFunction = (a: chatLogType, b: chatLogType) => a.time - b.time;

const MAX_STORED_MESSAGES_LENGTH = 50;

export function storeChat(message: Message<Room>): void {
    if (!Config.roomSettings[message.target.id]?.["logChannel"] || !Discord.isReady()) return;
    if (message.content.startsWith("/") && !message.content.startsWith("/log")) return;
    const content = message.content.replace("/log ", "");
    const dirPath = "./logs/chat";
    const filePath = dirPath + `/${message.target.roomid}.json`;
    let chatlog: chatLogType[] = [];

    if (fs.existsSync(filePath)) {
        chatlog = JSON.parse(fs.readFileSync(filePath, "utf-8")) as chatLogType[];
        if (chatlog.length > MAX_STORED_MESSAGES_LENGTH) {
            chatlog.length = MAX_STORED_MESSAGES_LENGTH - 1;
            chatlog.sort(sortLogFunction);
        } else if (chatlog.length === MAX_STORED_MESSAGES_LENGTH) {
            chatlog.shift();
        }
    } else if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    chatlog.push({
        user: message.author.id,
        content,
        time: message.time,
    });

    fs.writeFileSync(filePath, JSON.stringify(chatlog, null, 4));
}

export function sendModlog(message: Message<Room>): void {
    const targetChannelId = Config.roomSettings[message.target.roomid]?.["logChannel"];
    if (!targetChannelId || !Discord.isReady()) return;
    const log = message.content.replace("/log ", "");
    const filePath = `./logs/chat/${message.target.roomid}.json`;
    if (!fs.existsSync(filePath)) return;
    let originalChatlog: chatLogType[] = JSON.parse(fs.readFileSync(filePath, "utf-8")) as chatLogType[];
    let targetMessages: chatLogType[] = [];
    const targetChannel: undefined | Channel = Discord.channels.cache.get(targetChannelId);
    if (!targetChannel || !targetChannel.isTextBased()) return;

    const logDetails = Tools.getLogDetails(log);
    let additionalMessage: string = "";

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    switch (logDetails.action) {
        case "cleartext": {
            const userData = Database.get(logDetails.target);
            targetMessages = originalChatlog.filter((m) => [Tools.toId(logDetails.target), ...userData.alts].includes(m.user));
            targetMessages.sort(sortLogFunction);
            if (logDetails.lines) {
                targetMessages.splice(0, targetMessages.length - logDetails.lines);
            }
            break;
        }

        case "warn":
        case "mute":
        case "roomban":
        case "blacklist":
        case "lock": {
            const userData = Database.get(logDetails.target);
            targetMessages = originalChatlog.filter(
                (m) => [Tools.toId(logDetails.target), ...userData.alts].includes(m.user) && message.time !== m.time
            );
            targetMessages.sort(sortLogFunction);
            if (PS.user && message.target.checkCan("hidetext", PS.user, false)) {
                void message.target.hidetext(logDetails.target, true, null, true);
            }
            break;
        }

        case "promote": {
            additionalMessage = "Congratulations to " + logDetails.target + " on " + logDetails.auth + "!";
            break;
        }

        case "unrecognized": {
            return;
        }
    }

    if (targetMessages.length) {
        additionalMessage = targetMessages.map((i) => `<t:${i.time}:T> ${i.user}: ${i.content}`).join("\n");

        const targetMessageTimes = targetMessages.map((m) => m.time);
        originalChatlog = originalChatlog.filter((c) => !targetMessageTimes.includes(c.time));

        fs.writeFileSync(filePath, JSON.stringify(originalChatlog, null, 4));
    }

    targetChannel.send(log).catch((e) => {
        throw e;
    });
    if (additionalMessage)
        targetChannel.send(additionalMessage).catch((e) => {
            throw e;
        });
}
