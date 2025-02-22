"use strict";

import { Wordle } from "../wordle/main";

import type { BasePSCommandDefinitions } from "../../../types/commands";
import type { arrayOf } from "../../../types/utils";
import type { Room } from "../client/src";
import type { PSCommandContext } from "../parser";

// prettier-ignore
const WORDLE_ALIASES = ["initwordle", "createwordle", "newwordle", "announcewordle",
    "sendwordle", "requestwordle", "guesswordle", "endwordle", "wordle"] as const;
// prettier-ignore
const WORDLE_SUBCOMMANDS = ["init", "initialize", "n", "new", "create", "announce", "store", "save",
    "restore", "reload", "rebuild", "send", "request", "guess", "commend", "end"] as const;

export const commands: BasePSCommandDefinitions = {
    /*
    createtourgame: {
        run(argument, room, user): void {
            if (this.inPm()) return;
            if (!room.checkCan("broadcast", user, false)) return;
            if (!BotClient.ps.user || room.checkCan("tour", BotClient.ps.user, false)) return this.sayError("MISSING_BOT_RANK", "TOUR_GAME");
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
        run(): void {
            if (this.inRoom()) this.room.checkCan("html", BotClient.ps.status.id, true);
            if (this.inRoom() && !this.room.hasRank("+", this.user)) return;

            let [subCommand, roomId, guess] = this.argument.split(",");

            function isValidCommand(str: string, original: string): str is arrayOf<typeof WORDLE_ALIASES> {
                return Array.of(original, ...WORDLE_ALIASES).includes(str);
            }
            function isValidSubCommand(str: string): str is arrayOf<typeof WORDLE_SUBCOMMANDS> {
                return (Array.of(...WORDLE_SUBCOMMANDS) as string[]).includes(str);
            }

            if (!isValidCommand(this.command, this.originalName)) return this.say("Alias " + this.command + " not found");

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
                case "n":
                case "new":
                case "create": {
                    if (this.inPm()) {
                        if (!roomId) {
                            if (!this.user.hasRank("%") && !Config.developers.includes(this.user.id))
                                return this.sayError("INVALID_BOT_ROOM");
                            global.Wordles = {};
                            for (const r in Config.enableWordle) {
                                initWordle.call(this, r);
                            }
                            return;
                        } else {
                            const targetRoom = Rooms.get(roomId);
                            if (!targetRoom) return this.sayError("INVALID_BOT_ROOM", roomId);
                            if (!(roomId in Config.enableWordle)) return this.sayError("WORDLE_DISABLED", targetRoom.title);
                            if (!targetRoom.hasRank("%", this.user)) return this.sayError("PERMISSION_DENIED", "%");
                            initWordle.call(this, targetRoom.roomid, guess);
                        }
                    } else {
                        if (!this.inRoom()) return;
                        if (!(this.room.roomid in Config.enableWordle)) return this.sayError("WORDLE_DISABLED", this.room.title);
                        if (!this.room.hasRank("%", this.user) && !Config.developers.includes(this.user.id))
                            return this.sayError("PERMISSION_DENIED", "%");
                        initWordle.call(this, this.room.roomid, guess);
                    }
                    break;
                }

                case "announce": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    let targetRoom: Room | undefined;
                    if (this.inRoom()) targetRoom = this.room;
                    else targetRoom = Rooms.get(roomId);
                    if (!targetRoom || !targetRoom.exists) return this.sayError("INVALID_ROOM", roomId);
                    announce.call(this, targetRoom);
                    break;
                }

                case "store":
                case "save": {
                    if (!this.user.hasRank("%") && !Config.developers.includes(this.user.id))
                        return this.sayError("PERMISSION_DENIED", "%");
                    store();
                    this.say("Successfuly stored Wordle data!");
                    break;
                }

                case "rebuild":
                case "restore":
                case "reload": {
                    if (!this.user.hasRank("%") && !Config.developers.includes(this.user.id))
                        return this.sayError("PERMISSION_DENIED", "%");
                    Wordle.rebuild();
                    this.say("Successfuly loaded Wordle data!");
                    break;
                }

                case "send":
                case "request": {
                    if (!this.inPm()) return void this.user.send("You must use this command in PM.");
                    if (!roomId || !Rooms.has(roomId)) return this.sayError("INVALID_ROOM", roomId ? roomId : "");
                    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                    const targetRoom = Rooms.get(roomId)!;
                    if (!(roomId in Config.enableWordle) || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED", targetRoom.title);
                    send.call(this, targetRoom);
                    break;
                }

                case "guess": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    if (!(roomId in Config.enableWordle) || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED", roomId);
                    if (this.inRoom()) return;
                    parse.call(this, roomId, guess ?? "");
                    break;
                }

                case "commend": {
                    if (!roomId) {
                        if (!this.user.hasRank("%") && !Config.developers.includes(this.user.id)) {
                            return this.sayError("INVALID_ROOM");
                        } else {
                            for (const r in Wordles) {
                                const targetRoom = Rooms.get(r);
                                if (!targetRoom || !Wordles[r]) continue;
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                if (!Config.enableWordle[r]!.commend) {
                                    destroyWordle.call(this, targetRoom);
                                } else {
                                    commend.call(this, targetRoom);
                                }
                            }
                        }
                    } else {
                        let targetRoom: Room | undefined;
                        if (this.inRoom()) targetRoom = this.room;
                        else targetRoom = Rooms.get(roomId);
                        if (!targetRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED", targetRoom ? targetRoom.title : "");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        if (!Config.enableWordle[targetRoom.id]!.commend) {
                            destroyWordle.call(this, targetRoom);
                        } else {
                            commend.call(this, targetRoom);
                        }
                    }
                    break;
                }

                case "end": {
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    if (this.inPm() && !roomId) {
                        if (!this.user.hasRank("%") && !Config.developers.includes(this.user.id))
                            return this.sayError("PERMISSION_DENIED", "%");
                        for (const r in Wordles) {
                            const targetRoom = Rooms.get(r);
                            if (!targetRoom || !Wordles[roomId])
                                return this.sayError("WORDLE_DISABLED", targetRoom ? targetRoom.title : "");
                            destroyWordle.call(this, targetRoom, true);
                        }
                        return;
                    }
                    if (!roomId) return this.sayError("INVALID_ROOM");
                    let targetRoom: Room | undefined;
                    if (this.inRoom()) targetRoom = this.room;
                    else targetRoom = Rooms.get(roomId);
                    if (!targetRoom || !Wordles[roomId]) return this.sayError("WORDLE_DISABLED", targetRoom ? targetRoom.title : "");
                    destroyWordle.call(this, targetRoom, true);
                    break;
                }
                default:
                    return this.say("SubCommand " + (subCommand satisfies never) + " not found");
            }
        },
        aliases: Array.of(...WORDLE_ALIASES),
    },
};

function initWordle(this: PSCommandContext, r: string, answer?: string): void {
    r = Tools.toRoomId(r);
    if (answer) {
        answer = Tools.toId(answer);
        if (answer.length !== 5) return this.say("Invalid syntax. Length of the answer should be 5.");
    }
    const wordleRoom = Rooms.get(r);
    if (!wordleRoom || !wordleRoom.exists) return this.sayError("INVALID_ROOM");
    if (answer) global.Wordles[r] = new Wordle(wordleRoom, { answer });
    else global.Wordles[r] = new Wordle(wordleRoom);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (Config.enableWordle[r]!.announce) announce.call(this, wordleRoom);
}

function announce(this: PSCommandContext, r: Room): void {
    if (!r.hasRank("%", this.user) && !Config.developers.includes(this.user.id)) return;
    // prettier-ignore
    const announce =
        "<div class=\"infobox\">Today's Wordle is available now! " +
        "To play Wordle, push the bottom button!<br><button class=\"button\" " +
        "name=\"send\" value=\"/msgroom " + r.roomid + ",/botmsg " + BotClient.ps.status.id +
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

function send(this: PSCommandContext, wordleRoom: Room): void {
    if (!Wordles[wordleRoom.roomid]) return this.sayError("WORDLE_DISABLED", wordleRoom.title);
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

function parse(this: PSCommandContext, roomId: string, guess: string): void {
    roomId = Tools.toRoomId(roomId);
    guess = Tools.toId(guess);
    if (!roomId) return this.say("You must input a valid room id.");
    const wordleRoom = Rooms.get(roomId);
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
    const wordList = fs.readFileSync(`./src/ps/wordle/words/${guess.charAt(0)}.txt`, "utf-8").split("\n");
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (guess !== Wordles[roomId]!.answer && !wordList.includes(guess)) {
        wordleRoom.sendPrivateHtmlBox(this.user.userid, "Not in word list");
        resend(wordleRoom, this.user.userid);
        return;
    }

    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    wordleRoom.sendPrivateUhtml(this.user.userid, "wordle", Wordles[roomId]!.checkAns(guess, this.user.id));
    store();
}

function commend(this: PSCommandContext, wordleRoom: Room): void {
    if (!wordleRoom.hasRank("%", this.user) && !Config.developers.includes(this.user.id)) return;
    if (!Wordles[wordleRoom.roomid]) return this.sayError("WORDLE_DISABLED", wordleRoom.title);
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
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const answer = Wordles[wordleRoom.roomid]!.answer;
    const ansMessage = "The answer was: __" + answer.charAt(0).toUpperCase() + answer.slice(1) + "__";
    wordleRoom.send(message);
    wordleRoom.send(ansMessage);
    destroyWordle.call(this, wordleRoom);
}

function destroyWordle(this: PSCommandContext, wordleRoom: Room, force?: boolean): void {
    if (!Wordles[wordleRoom.roomid]) return;
    if (!wordleRoom.hasRank("%", this.user) && !Config.developers.includes(this.user.userid)) return;
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    Wordles[wordleRoom.roomid]!.destroyGame();
    wordleRoom.announce("The game of Wordle have " + (force ? "forcibly" : "") + " ended!");
}
