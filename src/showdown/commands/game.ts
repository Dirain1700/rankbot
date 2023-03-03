"use strict";

import { Wordle } from "../wordle/main";

import type { Room } from "@dirain/client";
import type { CommandContext } from "../parser";
import type { BaseCommandDefinitions } from "../../../types/commands";
import type { arrayOf } from "../../../types/utils";

// prettier-ignore
const WORDLE_ALIASES = ["initwordle", "createwordle", "newwordle", "announcewordle",
    "sendwordle", "requestwordle", "guesswordle", "endwordle", "wordle"] as const;
// prettier-ignore
const WORDLE_SUBCOMMANDS = ["init", "initialize", "new", "create", "announce", "store", "save",
    "restore", "reload", "rebuild", "send", "request", "guess", "commend", "end"] as const;

export const commands: BaseCommandDefinitions = {
    /*
    createtourgame: {
        run(argument, room, user): void {
            if (this.inPm()) return;
            if (!room.checkCan("broadcast", user, false)) return;
            if (!PS.user || room.checkCan("tour", PS.user, false)) return this.sayError("MISSING_BOT_RANK", "TOUR_GAME");
            const [format, ...rules] = argument.split(",");
            Games.create(format, [...rules]);
        },
        chatOnly: true,
        syntax: ["[format]", "[rules (optional)]"],
        aliases: ["ctg"],
    },
    endgame: {
        run(argument, room, user): void {
            if (this.inPm()) return;
            if (!room.activity || !room.checkCan("broadcast", user, false)) return;
        }
    }
    */
    wordle: {
        run(argument, room, user): void {
            if (this.inRoom()) this.room.checkCan("html", PS.status.id, true);
            if (this.inRoom() && !this.room.hasRank("+", user)) return;

            let [subCommand, roomId, guess] = argument.split(",");

            function isValidCommand(str: string, original: string): str is arrayOf<typeof WORDLE_ALIASES> {
                return Array.of(original, ...WORDLE_ALIASES).includes(str);
            }
            function isValidSubCommand(str: string): str is arrayOf<typeof WORDLE_SUBCOMMANDS> {
                return (Array.of(...WORDLE_SUBCOMMANDS) as string[]).includes(str);
            }

            if (!isValidCommand(this.command, this.originalCommand)) return this.say("Alias " + this.command + " not found");

            switch (this.command) {
                case "initwordle":
                case "createwordle":
                case "newwordle":
                    roomId = subCommand;
                    subCommand = "new";
                    break;
                case "announcewordle":
                    roomId = subCommand;
                    subCommand = "announce";
                    break;
                case "sendwordle":
                case "requestwordle":
                    roomId = subCommand;
                    subCommand = "send";
                    break;
                case "guesswordle":
                    guess = roomId;
                    roomId = subCommand;
                    subCommand = "guess";
                    break;
                case "endwordle":
                    roomId = subCommand;
                    subCommand = "end";
                    break;
                case "wordle":
                    break;
                default:
                    return this.say("Alias " + (this.command satisfies never) + " not found");
            }
            if (!subCommand) return this.say("No argument in this command not allowed.");
            subCommand = Tools.toId(subCommand);
            if (this.inRoom()) {
                guess = roomId;
                roomId = this.room.roomid;
            }
            if (roomId) roomId = Tools.toRoomId(roomId);
            if (guess) guess = Tools.toId(guess);
            else guess = "";
            if (!isValidSubCommand(subCommand)) return this.say("SubCommand " + subCommand + " not found");

            switch (subCommand) {
                case "init":
                case "initialize":
                case "new":
                case "create": {
                    if (this.inPm()) {
                        if (!roomId) {
                            if (!user.hasRank("%") && !Config.developers.includes(user.id)) return this.sayError("INVALID_BOT_ROOM");
                            global.Wordles = {};
                            for (const r of Config.enableWordle) {
                                initWordle.call(this, r);
                            }
                            return;
                        } else {
                            const targetRoom = PS.rooms.cache.get(roomId);
                            if (!targetRoom) return this.sayError("INVALID_BOT_ROOM");
                            if (!targetRoom.hasRank("%", this.user)) return this.sayError("PERMISSION_DENIED");
                            initWordle.call(this, targetRoom.roomid);
                        }
                    } else {
                        if (!this.inRoom()) return;
                        if (!this.room.hasRank("%", user) && !Config.developers.includes(user.id)) return;
                        initWordle.call(this, this.room.roomid);
                    }
                    break;
                }

                case "announce": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    let targetRoom: Room | undefined;
                    if (this.inRoom()) targetRoom = this.room;
                    else targetRoom = PS.rooms.cache.get(roomId);
                    if (!targetRoom || !targetRoom.isExist) return this.sayError("INVALID_ROOM");
                    announce.call(this, targetRoom);
                    break;
                }

                case "store":
                case "save": {
                    if (!user.hasRank("%") && !Config.developers.includes(user.id)) return this.sayError("PERMISSION_DENIED");
                    store();
                    this.say("Successfuly stored Wordle data!");
                    break;
                }

                case "rebuild":
                case "restore":
                case "reload": {
                    if (!user.hasRank("%") && !Config.developers.includes(user.id)) return this.sayError("PERMISSION_DENIED");
                    rebuild();
                    this.say("Successfuly loaded Wordle data!");
                    break;
                }

                case "send":
                case "request": {
                    if (!this.inPm()) return void user.send("You must use this command in PM.");
                    if (!roomId || !PS.rooms.cache.has(roomId)) return this.sayError("INVALID_ROOM");
                    if (!Config.enableWordle.includes(roomId) || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    send.call(this, PS.rooms.cache.get(roomId)!);
                    break;
                }

                case "guess": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    if (!Config.enableWordle.includes(roomId) || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
                    if (this.inRoom()) {
                        this.room.hidetext(user.userid, true, 1, "Leaking Wordle");
                        return;
                    }
                    parse.call(this, roomId, guess ?? "");
                    break;
                }

                case "commend": {
                    if (!roomId) {
                        if (!user.hasRank("%") && !Config.developers.includes(user.id)) {
                            return this.sayError("INVALID_ROOM");
                        } else {
                            for (const r of Object.keys(Wordles)) {
                                const targetRoom = PS.rooms.cache.get(r);
                                if (!targetRoom || !Wordles[r]) continue;
                                commend.call(this, targetRoom);
                            }
                        }
                    } else {
                        let targetRoom: Room | undefined;
                        if (this.inRoom()) targetRoom = this.room;
                        else targetRoom = PS.rooms.cache.get(roomId);
                        if (!targetRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
                        commend.call(this, targetRoom);
                    }
                    break;
                }

                case "end": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    if (this.inPm() && !roomId) {
                        if (!user.hasRank("%") && !Config.developers.includes(user.id)) return this.sayError("PERMISSION_DENIED");
                        for (const r in Wordles) {
                            const targetRoom = PS.rooms.cache.get(r);
                            if (!targetRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
                            destroyWordle.call(this, targetRoom, true);
                        }
                        return;
                    }
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    let targetRoom: Room | undefined;
                    if (this.inRoom()) targetRoom = this.room;
                    else targetRoom = PS.rooms.cache.get(roomId);
                    if (!targetRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
                    destroyWordle.call(this, targetRoom, true);
                    break;
                }
                default:
                    return this.say("SubCommand " + (subCommand satisfies never) + " not found");
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aliases: Array.of(...WORDLE_ALIASES),
    },
};

function initWordle(this: CommandContext, r: string): void {
    r = Tools.toRoomId(r);
    const wordleRoom = PS.rooms.cache.get(r);
    if (!wordleRoom || !wordleRoom.isExist) return this.sayError("INVALID_ROOM");
    global.Wordles[r] = new Wordle(wordleRoom);
    announce.call(this, wordleRoom);
}

function announce(this: CommandContext, r: Room): void {
    if (!r.hasRank("%", this.user) && !Config.developers.includes(this.user.id)) return;
    // prettier-ignore
    const announce =
        "<div class=\"infobox\">Today's Wordle is available now! " +
        "To play Wordle, push the bottom button!<br><button class=\"button\" " +
        "name=\"send\" value=\"/msgroom " + r.roomid + ",/botmsg " + PS.status.id +
        ",?wordle send," + r.roomid + "\">Play wordle!</button></div>";
    const id = "wordle-announce";
    r.sendUhtml(id, announce, false);
}
function store(): void {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    for (let r in Wordles) {
        r = Tools.toRoomId(r);
        if (!Wordles[r]) continue;

        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const data = Wordles[r]!.store();
        let path = `./logs/wordle/${r}/${year}/${month}`;
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        path += `/${day}.json`;
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
    }
}

function rebuild(): void {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    for (let r of Config.enableWordle) {
        r = Tools.toRoomId(r);
        const room = PS.rooms.cache.get(r);
        if (!room) continue;
        const path = `./logs/wordle/${r}/${year}/${month}/${day}.json`;
        if (!fs.existsSync(path)) continue;
        try {
            const data = JSON.parse(fs.readFileSync(path, "utf-8"));
            Wordles[r] = new Wordle(room, data);
        } catch (e) {
            console.error(e);
        }
    }
}

function send(this: CommandContext, wordleRoom: Room): void {
    if (!Wordles[wordleRoom.roomid]) return this.sayError("WORDLE_DISABLED");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (Wordles[wordleRoom.roomid]!.ended) return this.say("Today's Wordle have ended, Try tomorrow!");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (Wordles[wordleRoom.roomid]!.endedPl.includes(this.user.userid)) {
        resend(wordleRoom, this.user.userid);
        return wordleRoom.sendPrivateHtmlBox(this.user.userid, "You have already played Wordle today, so you can't play more today!");
    }
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (this.user.id in Wordles[wordleRoom.roomid]!.pl) return resend(wordleRoom, this.user.userid);
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    Wordles[wordleRoom.roomid]!.pl.set(this.user.userid, { round: 0, html: "" });
    resend(wordleRoom, this.user.userid);
    store();
}
function resend(wordleRoom: Room, user: string): void {
    if (!Wordles[wordleRoom.roomid]) return;
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    wordleRoom.sendPrivateUhtml(user, "wordle", Wordles[wordleRoom.roomid]!.generate(user));
}

function parse(this: CommandContext, roomId: string, guess: string): void {
    roomId = Tools.toRoomId(roomId);
    guess = Tools.toId(guess);
    if (!roomId) return this.say("You must input a valid room id.");
    const wordleRoom = PS.rooms.cache.get(roomId);
    if (!wordleRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (Wordles[roomId]!.ended) return this.say("Today's Wordle have ended, Try tomorrow!");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (this.user.id in Wordles[roomId]!.endedPl) {
        resend(wordleRoom, this.user.userid);
        return;
    }
    if (!guess || guess.length !== 5) {
        this.say("Invalid guess. Guessed word must have 5 characters.");
        resend(wordleRoom, this.user.userid);
        return;
    }
    const wordList = fs.readFileSync(`./src/showdown/wordle/words/${guess.charAt(0)}.txt`, "utf-8").split("\n");
    if (!wordList.includes(guess)) {
        wordleRoom.sendPrivateHtmlBox(this.user.userid, "Not in word list");
        resend(wordleRoom, this.user.userid);
        return;
    }

    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    wordleRoom.sendPrivateUhtml(this.user.userid, "wordle", Wordles[roomId]!.checkAns(guess, this.user.id));
    store();
}
function commend(this: CommandContext, wordleRoom: Room): void {
    if (!wordleRoom.hasRank("%", this.user) && !Config.developers.includes(this.user.id)) return;
    if (!Wordles[wordleRoom.roomid]) return this.sayError("WORDLE_DISABLED");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const winners = Wordles[wordleRoom.roomid]!.getWinners();
    const winnersList: string[] = [];

    if (winners.length) {
        for (const [name, round] of winners) {
            winnersList.push(`${name} (${round})`);
        }
    }
    let message: string;
    if (!winners.length) message = "No one wins from today's Wordle!";
    else message = "**Today's Wordle winners: " + winnersList.join(", ") + "**";
    wordleRoom.send(message);
    destroyWordle.call(this, wordleRoom);
}
function destroyWordle(this: CommandContext, wordleRoom: Room, force?: boolean): void {
    if (!Wordles[wordleRoom.roomid]) return;
    if (!wordleRoom.hasRank("%", this.user)) return;
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    Wordles[wordleRoom.roomid]!.destroyGame();
    wordleRoom.announce("The game of Wordle have " + (force ? "forcibly" : "") + " ended!");
}
