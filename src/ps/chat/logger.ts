"use strict";

import { analyzeComment } from "./detoxify";

import type { IATTRIBUTES, IAttractiveScore } from "../../../types/perspective";
import type { Message, Room } from "../client/src";
import type { Channel } from "discord.js";

interface chatLogType {
    user: string;
    content: string;
    time: number;
    scores: { [key in keyof IATTRIBUTES]: IAttractiveScore } | null;
    spam?: boolean;
}

const sortLogFunction = (a: chatLogType, b: chatLogType) => a.time - b.time;

const SEC = 1000;
const TEN_SEC = 10 * SEC;

const MAX_STORED_MESSAGES_LENGTH = 50;
const MAX_MESSAGES_PER_TEN_SECONDS = 5;

export async function storeChat(message: Message<Room>) {
    if (!Config.roomSettings[message.target.id]?.["logChannel"] || !BotClient.disc.isReady()) return;
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

    let flooding = false;

    if (
        !message.target.isStaff(message.author) &&
        chatlog.filter((m) => m.time >= Date.now() - TEN_SEC && m.user === message.author.userid).length >= MAX_MESSAGES_PER_TEN_SECONDS
    ) {
        if (Config.roomSettings[message.target.roomid]?.floodFilter) {
            void message.target.mute(message.author, false, "Flooding");
            flooding = true;
        } else flooding = true;
    }

    chatlog.push({
        user: message.author.id,
        content,
        time: message.time,
        scores:
            Config.roomSettings[message.target.roomid]?.["useAPI"] && !message.command
                ? (
                      await analyzeComment(content).catch(() => {
                          return { attributeScores: null };
                      })
                  ).attributeScores
                : null,
        spam: flooding,
    });

    fs.writeFileSync(filePath, JSON.stringify(chatlog, null, 4));
}

export function sendModlog(message: Message<Room>): void {
    const targetChannelId = Config.roomSettings[message.target.roomid]?.["logChannel"];
    if (!targetChannelId || !BotClient.disc.isReady()) return;
    const log = message.content.replace("/log ", "");
    const filePath = `./logs/chat/${message.target.roomid}.json`;
    if (!fs.existsSync(filePath)) return;
    let originalChatlog: chatLogType[] = JSON.parse(fs.readFileSync(filePath, "utf-8")) as chatLogType[];
    let targetMessages: chatLogType[] = [];
    const targetChannel: undefined | Channel = BotClient.disc.channels.cache.get(targetChannelId);
    if (!targetChannel || !targetChannel.isTextBased() || !targetChannel.isSendable()) return;

    const logDetails = Tools.getLogDetails(log);
    let additionalMessage: string = "";

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
            if (BotClient.ps.user && message.target.checkCan("hidetext", BotClient.ps.user, false)) {
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

    void targetChannel.send(log);
    if (additionalMessage) void targetChannel.send(additionalMessage);
}
