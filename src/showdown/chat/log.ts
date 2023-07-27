"use strict";

import type { Message, Room } from "@dirain/client";
import type { Channel } from "discord.js";

interface chatLogType {
    user: string;
    content: string;
    time: number;
}

const sortLogFunction = (a: chatLogType, b: chatLogType) => a.time - b.time;

const MAX_STORED_MESSAGES_LENGTH = 50;

export function storeChat(message: Message<Room>): void {
    if (!(message.target.roomid in Config.logChannels) || !discord.isReady()) return;
    if (message.content.startsWith("/") && !message.content.startsWith("/log")) return;
    const content = message.content.replace("/log ", "");
    const filePath = `./logs/chat/${message.target.roomid}.json`;
    let chatlog: chatLogType[] = [];

    if (fs.existsSync(filePath)) {
        chatlog = JSON.parse(fs.readFileSync(filePath, "utf-8")) as chatLogType[];
        if (chatlog.length > MAX_STORED_MESSAGES_LENGTH) {
            chatlog.length = MAX_STORED_MESSAGES_LENGTH - 1;
            chatlog.sort(sortLogFunction);
        } else if (chatlog.length === MAX_STORED_MESSAGES_LENGTH) {
            chatlog.shift();
        }
    }

    chatlog.push({
        user: message.author.id,
        content,
        time: message.time,
    });

    fs.writeFileSync(filePath, JSON.stringify(chatlog, null, 4));
}

export function sendModlog(message: Message<Room>): void {
    const targetChannelId = Config.logChannels[message.target.roomid];
    if (!targetChannelId || !discord.isReady()) return;
    let log = message.content.replace("/log ", "");
    const filePath = `./logs/chat/${message.target.roomid}.json`;
    if (!fs.existsSync(filePath)) return;
    const messages: chatLogType[] = JSON.parse(fs.readFileSync(filePath, "utf-8")) as chatLogType[];
    let chatLogs: chatLogType[] = [];
    const targetChannel: undefined | Channel = discord.channels.cache.get(targetChannelId);
    if (!targetChannel || !targetChannel.isTextBased()) return;

    /* eslint-disable no-useless-escape */
    const clearTextRegex: RegExp = new RegExp(
        `(?<target>^.{2,20})'s messages were cleared from ${message.target.title} by (?<staff>.{2,20})\.( \((?<reason>.*)\))?`
    );
    const clearLinesRegex: RegExp = new RegExp(
        `(?<lines>^\d{1,3}) of (?<target>.{2,20})'s messages were cleared from ${message.target.title} by (?<staff>.{2,20})\.( \((?<reason>.*)\))?`
    );
    const warnRegex: RegExp = /(?<target>.{2,20}) was warned by (?<staff>.{2,20})\.( \((?<reason>.*)\))?/m;
    const roomBanRegex: RegExp = new RegExp(
        `(?<target>^.{2,20}) was banned from ${message.target.title} by (?<staff>.{2,20})\.( \((?<reason>.*)\))?`
    );
    const weekBanRegex: RegExp = new RegExp(
        `(?<target>^.{2,20}) was banned for a week from ${message.target.title} by (?<staff>.{2,20})\.( \((?<reason>.*)\))?`
    );
    const lockRegex: RegExp = /(?<target>^.{2,20}) was locked from talking by (?<staff>.{2,20})\.( \((?<reason>.*)\))?/;
    const muteRegex: RegExp = /(?<target>^.{2,20}) was muted by (?<staff>.{2,20}) for (?<time>(7 minutes|1 hour))\.( \((?<reason>.*)\))?/;
    const promoteRegex: RegExp =
        /(?<target>^.{2,20}) was ((promoted to (?<auth>(Room|Global) (Voice|Driver|Moderator)))|appointed to Room Owner) by (?<staff>.{2,20})\./;
    const demoteRegex: RegExp =
        /\((?<target>.{2,20}) was demoted to (?<auth>(Room|Global) (regular user|Voice|Driver|Moderator)) by (?<staff>.{2,20})\.\)/;
    /* eslint-enable */

    let isPunish: boolean | null = null;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (log.match(clearLinesRegex)) {
        isPunish = true;
        const { lines, target } = log.match(clearLinesRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
        chatLogs.length = parseInt(lines as string);
    } else if (log.match(clearTextRegex)) {
        isPunish = true;
        const { target } = log.match(clearTextRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    } else if (log.match(warnRegex)) {
        isPunish = true;
        const { target } = log.match(warnRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    }
    if (log.match(roomBanRegex)) {
        isPunish = true;
        const { target } = log.match(roomBanRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    } else if (log.match(weekBanRegex)) {
        isPunish = true;
        const { target } = log.match(weekBanRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    } else if (log.match(lockRegex)) {
        isPunish = true;
        const { target } = log.match(lockRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    } else if (log.match(muteRegex)) {
        isPunish = true;
        const { target } = log.match(muteRegex)!.groups ?? {};
        chatLogs = messages.filter((m) => m.user == Tools.toId(target as string));
        chatLogs.sort(sortLogFunction);
    } else if (log.match(promoteRegex)) {
        isPunish = false;
        const { target, auth } = log.match(promoteRegex)!.groups ?? {};
        log = `${log}\nCongrats ${target!} to ${auth!}!`;
    } else if (log.match(demoteRegex)) {
        isPunish = false;
    }

    if (isPunish === null) return;

    let logsToSend: string = "";

    if (chatLogs.length) logsToSend = chatLogs.map((i) => `<t:${i.time}:T> ${i.user}: ${i.content}`).join("\n");

    targetChannel.send(log + "\n" + logsToSend).catch(() => console.error("content:", log + "\n" + logsToSend));
}
