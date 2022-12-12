"use strict";

import { scheduleJob } from "node-schedule";
import { Room } from "@dirain/client";
import type { Message, User, ClientUser } from "@dirain/client";

import { enableModchat, disableModchat } from "./chat/modchat";
import announceModChat from "./chat/raw";
import runjs from "./global/runjs";
import sendlog from "./chat/sendlog";
import help from "./global/help";
import hotpatch from "./global/hotpatch";
import output from "./global/output";
import resetlog from "./global/resetlog";
import invite from "./pm/invite";
import { createTour, announce, configure, fixTourData } from "./tour/official";
import { rerollPokemon } from "./tour/game";
import random from "./tour/random";
import setTourConfigs from "./tour/tourmanager";
import chatFilter from "./chat/filter";
import {
    init as initWordle,
    commend as commendWordle,
    parse as parseWordle,
    send as sendWordle,
    rebuild as rebuildWordle,
    destroyWordle,
    sendButton as sendWordleButton,
} from "./wordle/index";

export default () => {
    PS.on("ready", () => {
        console.log("Logged in as", (PS.user as ClientUser).name);
        setTimeout(() => {
            rebuildWordle();
        }, 3000);
    });

    PS.on("messageCreate", (message: Message<unknown>) => {
        if (!message.isNotUnknown() || message.author.userid === PS.status.id) return;
        if (message.content.startsWith("?help")) {
            help(message);
        }

        if (message.content.startsWith("?sendWordleButton")) {
            sendWordleButton(message);
        }

        if (message.author.userid === config.owner) {
            if (message.content === "?resetlog") {
                resetlog(message);
            }

            if (message.content.startsWith("?hotpatch")) {
                hotpatch(message);
            }

            if (message.content.startsWith("echo")) {
                PS.send(message.content.substring(5));
            }

            if (message.content.startsWith("?export")) {
                output(message);
            }

            if (message.content.startsWith("?runjs")) {
                runjs(message);
            }

            if (message.content === "process.exit(0)") {
                process.exit(0);
            }
        }

        if (message.isUserMessage()) {
            if (message.content.startsWith("/invite")) {
                invite(message);
            }

            // eslint-disable-next-line no-useless-escape
            if (/\.fixTourData \w+ \d{8} [\[\]a-zA-Z0-9 ]+/.test(message.content)) {
                fixTourData(message);
            }

            if (message.content.startsWith("?requestWordle")) {
                sendWordle(message);
            }

            if (message.content.startsWith("?guess")) {
                parseWordle(message);
            }
        }

        if (message.isRoomMessage()) {
            chatFilter(message);
            if (message.target.id === "japanese") {
                logmsg(message);
                if (message.content.startsWith("/log")) {
                    sendlog(message);
                }
            }
            if (message.content.toLowerCase() === "?randtour") {
                random(message);
            }
            if (message.content.startsWith("?rerollPokemon")) {
                rerollPokemon(message);
            }
            if (message.author.id === config.owner) {
                if (message.content === "?initWordle") {
                    initWordle();
                }
                if (message.content === "?destroyWordle") {
                    destroyWordle(true);
                }
            }
        }
    });

    PS.on("tourCreate", (room: Room, format: string) => {
        setTourConfigs(room, format);
    });

    PS.on("roomUserAdd", (room: Room, user: User): Promise<void> => disableModchat(room, user));

    PS.on("roomUserRemove", (room: Room, user: User): Promise<void> => enableModchat(room, user));

    PS.on("rawData", (message: string, room: Room): void => announceModChat(message, room));

    PS.on("userRename", async (NewU) => {
        const room = new Room(
            {
                id: "japanese",
                roomid: "japanese",
                type: "chat",
            },
            PS
        );
        enableModchat(room, NewU);
    });

    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    scheduleJob("0 0 13 * * *", () => {
        createTour(PS.rooms.cache.get("japanese")!);
    });

    scheduleJob("0 30 12 * * *", () => {
        announce(PS.rooms.cache.get("japanese")!);
    });

    scheduleJob("0 0 12 * * *", () => {
        configure(PS.rooms.cache.get("japanese")!);
    });

    scheduleJob("0 0 23 * * *", () => {
        initWordle();
    });

    scheduleJob("0 0 14 * * *", () => {
        commendWordle(PS.rooms.cache.get("japanese")!);
        destroyWordle();
    });

    /* eslint-enable */

    function logmsg(message: Message<Room>): void {
        const add = {
            content: message.content,
            user: message.author?.userid ?? "&",
            time: message.time,
        };
        const file = "./config/chatlog.json";
        const json: { content: string; user: string; time: number }[] = JSON.parse(fs.readFileSync(file, "utf-8"));
        if (json.length >= 100) json.length = 100;
        json.unshift(add);
        fs.writeFileSync(file, JSON.stringify(json, null, 4));
    }
};
