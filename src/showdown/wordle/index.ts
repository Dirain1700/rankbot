"use strict";

import { Tools } from "@dirain/client";
import type { Message, User, Room } from "@dirain/client";
import { Wordle } from "./main";

export const store = (r: string): void => {
    r = Tools.toRoomId(r);
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = wordles[r]!.store();
    let path = `./logs/wordle/${r}/${year}/${month}`;
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    path += `/${day}.json`;
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};
export const init = async (): Promise<void> => {
    for (const r of config.wordle) {
        const room = PS.rooms.cache.get(Tools.toRoomId(r));
        if (!room) break;
        global.wordles[Tools.toId(r)] = new Wordle(room as Room);

        // prettier-ignore
        const announce = `<div>Today's Wordle is available now! To play Wordle, push the bottom button!<br><button class="button" name="send" value="/botmsg ${PS.status.id},?requestWordle ${Tools.toId(r)}">Play wordle!</button></div>`;
        PS.send(r + "|/addhtmlbox " + announce);
        store(r);
    }
};

const fail = (reason: string, room: string, user: string) => {
    room = Tools.toRoomId(room);
    if (room) {
        PS.send(`${room}|/sendprivateuhtml ${user},wordle,${(wordles[room] as Wordle).generate(user)}`);
        PS.send(`${room}|/sendprivatehtmlbox ${user},${reason}`);
    } else {
        PS.send(`|/msg ${user},${reason} To resend Wordle, push the button in the chatroom.`);
    }
};

export const parse = (message: Message<User>): void => {
    const {
        author: { id },
    } = message;
    const args = message.content
        .replace("?guess ", "")
        .split(",")
        .map((e) => Tools.toRoomId(e));
    const [room, guess] = args;
    if (!room || !guess) return void fail("Invalid syntax.", "", id);
    if (!wordles[room]) return void fail(`The game of Wordle is not enabled for room ${room}.`, "", id);
    if (guess.length !== 5) return void fail("Invalid guess. Strings must have 5 characters.", room, id);
    const wordList = fs.readFileSync(`./src/showdown/wordle/words/${guess.charAt(0)}.txt`, "utf-8").split("\n");
    if (!wordList.includes(guess)) return void fail("Not in word list", room, id);

    PS.send(`${room}|/sendprivateuhtml ${id},wordle,${(wordles[room] as Wordle).checkAns(guess, message.author.id)}`);
    store(room);
};

export const send = (message: Message<User>): void => {
    const room = Tools.toRoomId(message.content.replace("?requestWordle", ""));
    if (!room) return void message.reply("Invalid Syntax: Missing room");
    const hour = new Date().getHours();
    if (hour > 14 && hour < 23) {
        return void message.reply("Today's Wordle has been ended! Try tomorrow!");
    }
    if (!wordles[room]) return void message.reply(`The game of Wordle is not enabled for room ${room}.`);

    const {
        author: { id },
    } = message;

    if ((wordles[room] as Wordle).endedPl.includes(id))
        return void fail("You are already played Wordle today, so you can't play more today!", room, id);
    if ((wordles[room] as Wordle).pl.has(id))
        return void PS.send(`${room}|/sendprivateuhtml ${id},wordle,${(wordles[room] as Wordle).generate(id)}`);
    (wordles[room] as Wordle).pl.set(id, { round: 0, html: "" });
    PS.send(`${room}|/sendprivateuhtml ${id},wordle,${(wordles[room] as Wordle).generate(id)}`);
    store(room);
};

export const commend = (room: Room) => {
    const winners = (wordles[room.id] as Wordle).commend();
    const winnersList: string[] = [];

    if (winners.length) {
        for (const [name, round] of winners) {
            winnersList.push(`${name} (${round})`);
        }
    }

    let message: string;
    if (!winners.length) message = "No one wins in today's Wordle!";
    else message = "**Today's Wordle winners: " + winnersList.join(", ") + "**";

    room.send(message);
};

export const rebuild = () => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    for (const r of config.wordle) {
        const room = PS.rooms.cache.get(Tools.toId(r));
        if (!room) break;
        const path = `./logs/wordle/${r}/${year}/${month}/${day}.json`;
        if (!fs.existsSync(path)) break;
        const data = JSON.parse(fs.readFileSync(path, "utf-8"));

        const wordle = new Wordle(room);
        wordle.rebuild(data, room);
        wordles[Tools.toId(r)] = wordle;
    }
};

export const destroyWordle = (force?: boolean) => {
    global.wordles = {};
    for (const r of config.wordle) {
        PS.send(`${r}|/announce The game of Wordle has ${force ? "forcibly" : "been"} ended!`);
    }
};

export const sendButton = (message: Message<unknown>): void => {
    if (!message.isNotUnknown()) return;
    const announce = (r: string) =>
        `<div>Today's Wordle is available now! To play Wordle, push the bottom button!<br><button class="button" name="send" value="/botmsg ${
            PS.status.id
        },?requestWordle ${Tools.toId(r)}">Play wordle!</button></div>`;
    const { author, content } = message;
    if (message.isRoomMessage()) {
        const { target } = message;
        if (!target.isVoice(author.id) && !target.isStaff(author)) return;
        if (!wordles[target.id]) return void message.reply(`The game of Wordle is not enabled for room ${target.id}.`);
        message.reply("/addhtmlbox " + announce(target.id));
    } else if (message.isUserMessage()) {
        const r = Tools.toRoomId(content.replace("?sendWordleButton", ""));
        if (!PS.rooms.cache.has(r) || !wordles[r]) return void message.reply(`The game of Wordle is not enabled for room ${r}.`);
        PS.send(`${r}|/sendprivatehtmlbox ${author.id},${announce(r)}`);
    }
};
