"use strict";

import { scheduleJob } from "node-schedule";

import { checkChat } from "./chat/filter";
import { storeChat, sendModlog } from "./chat/logger";
import announceModchat from "./chat/modchat/detect";
import enableModchat from "./chat/modchat/enable";
import { User } from "./client/src";
import { PSCommandContext } from "./parser";
import { Wordle } from "./wordle/main";

import type { Message, ModchatLevel, Room } from "./client/src";

export const onMessage = (message: Message) => {
    if (message.author.userid === PS.status.id) return;
    PSCommandParser.parse(message);
    if (message.inRoom()) {
        if (Config.onRoomMessage[message.target.roomid]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onRoomMessage[message.target.roomid]!.call(message);
        }
        if (Config.roomSettings[message.target.id]) {
            checkChat(message);
            storeChat(message);
            sendModlog(message);
        }
    }
};
export const onUserAdd = (room: Room, user: User): void => {
    if (user.id in Config.onUserJoin) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const runtimeData = Config.onUserJoin[user.id]!;
        if (Date.now() - runtimeData.lastTime >= runtimeData.cooldown) {
            runtimeData.run.call(user);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onUserJoin[user.id]!.lastTime = Date.now();
        }
    }
};
export const onUserRemove = (room: Room, user: User): boolean => enableModchat(user, room);
export const onModchat = (room: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void => {
    announceModchat(room, currentModchatLevel, previousModchatLevel);
};
export const onUserRename = (NewU: User) => enableModchat(NewU);
export const onTournamentCreate = (room: Room) => {
    if (Config.onTournamentCreate[room.roomid] && room.tour) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Config.onTournamentCreate[room.roomid]!.call(room.tour);
    }
};
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const onReady = () => {
    console.log("Logged in as", PS.user!.name);

    if (!Config.developers[0]) return;

    const developer = new User({
        id: Config.developers[0],
        userid: Config.developers[0],
        name: Config.developers[0],
        rooms: false,
        group: "%",
    });

    scheduleJob("0 0 23 * * *", () => {
        new PSCommandContext("wordle", "wordle", "create", PS.user!, developer, 0).run();
    });

    scheduleJob("0 0 14 * * *", () => {
        new PSCommandContext("wordle", "wordle", "commend", PS.user!, developer, 0).run();
    });
    setTimeout(() => {
        Wordle.rebuild();
    }, 3 * 1000);
};

/* eslint-enable */
export function setEventListeners() {
    PS.on("messageCreate", onMessage);
    PS.on("roomUserAdd", onUserAdd);
    PS.on("roomUserRemove", onUserRemove);
    PS.on("chatError", console.log);
    PS.on("error", console.log);
    PS.on("modchat", onModchat);
    PS.on("userRename", onUserRename);
    PS.on("tourCreate", onTournamentCreate);
    PS.on("ready", onReady);
}
