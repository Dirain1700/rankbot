"use strict";

import { scheduleJob } from "node-schedule";
import type { Message, Room } from "@dirain/client";

import setModChat from "./chat/modchat";
import announceModChat from "./chat/raw";
import runjs from "./global/runjs";
import sendlog from "./chat/sendlog";
import help from "./global/help";
import hotpatch from "./global/hotpatch";
import output from "./global/output";
import resetlog from "./global/resetlog";
import invite from "./pm/invite";
import { createTour, announce } from "./tour/official";
import random from "./tour/random";
import setTourConfigs from "./tour/tourmanager";

export default () => {
    PS.on("ready", () => console.log("Logged in as", PS.user!.name));

    PS.on("messageCreate", (message: Message<unknown>) => {
        if (!message.isNotUnknown() || message.author.userid === PS.status.id) return;
        if (message.content.startsWith("?help")) {
            help(message);
        }
        if (message.content === "?resetlog") {
            resetlog(message);
        }
        if (message.content.startsWith("?hotpatch")) {
            hotpatch(message);
        }
        if (message.content.startsWith("echo") && message.author.userid === config.owner) PS.send(message.content.substring(4));
        if (message.content.startsWith("?export")) {
            output(message);
        }
        if (message.content.startsWith(">runjs")) {
            runjs(message);
        }
        if (message.content === "process.exit(0)" && message.author.userid === config.owner) process.exit(0);
    });

    PS.on("message", async (message: Message<unknown>) => {
        if (!message.isUserMessage()) return;
        if (message.content.startsWith("/invite")) {
            invite(message);
        }
    });

    PS.on("messageCreate", (message: Message<unknown>): void => {
        if (!message.isRoomMessage()) return;
        if (message.target.id === "japanese") logmsg(message);
        if (message.content.startsWith("/log") && message.target.id === "japanese") {
            sendlog(message);
        }
        if (message.content.toLowerCase() === "?randtour") random(message);
    });

    PS.on("tourCreate", (room: Room, format: string) => {
        setTourConfigs(room, format);
    });

    PS.on("leave", (room, user): void => setModChat(room, user));

    PS.on("rawData", (message: Message<Room>): void => announceModChat(message));

    scheduleJob("0 0 13 * * *", () => {
        createTour(PS.rooms.get("japanese")!);
    });

    scheduleJob("0 30 12 * * *", () => {
        announce(PS.rooms.get("japanese")!);
    });

    function logmsg(message: Message<Room>): void {
        const add = {
            content: message.content,
            user: message.author?.userid ?? "&",
            time: message.time,
        };
        const file = path.resolve(__dirname, "./../config/chatlog.json");
        const json: { content: string; user: string; time: number }[] = JSON.parse(fs.readFileSync(file, "utf-8"));
        if (json.length >= 100) json.length = 100;
        json.unshift(add);
        fs.writeFileSync(file, JSON.stringify(json, null, 4));
    }
};
