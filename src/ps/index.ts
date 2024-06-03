"use strict";

import { checkChat } from "./chat/filter";
import { storeChat, sendModlog } from "./chat/logger";
import announceModchat from "./chat/modchat/detect";
import enableModchat from "./chat/modchat/enable";

import { PSAPIError } from "./client/src";

import { setNextScheduledTournament } from "./scheduled-scripts";
import { onError } from "../setup";

import type { Message, ModchatLevel, Room, User } from "./client/src";

export const onMessage = (message: Message) => {
    if (message.inRoom()) {
        if (Config.roomSettings[message.target.id]) {
            checkChat(message);
            storeChat(message);
            sendModlog(message);
        }
        if (message.author.userid === PS.status.id) return;
        if (Config.onRoomMessage[message.target.roomid]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onRoomMessage[message.target.roomid]!.call(message);
        }
    }
    if (message.author.userid === PS.status.id) return;
    PSCommandParser.parse(message);
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
export const onClientRoomAdd = (room: Room) => {
    setNextScheduledTournament(room.id);
};
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
};

export const onChatError = (err: string, room: Room | null) => {
    const error = new PSAPIError("CUSTOM", err + "\n" + " in room " + Tools.toString(room) + "\n at " + new Date().toUTCString());
    console.log(error.stack);
    onError("NormalError", error.stack!);
};

/* eslint-enable */
export function setEventListeners() {
    PS.on("messageCreate", onMessage);
    PS.on("roomUserAdd", onUserAdd);
    PS.on("roomUserRemove", onUserRemove);
    PS.on("clientRoomAdd", onClientRoomAdd);
    PS.on("chatError", onChatError);
    PS.on("clientError", console.log);
    PS.on("modchat", onModchat);
    PS.on("userRename", onUserRename);
    PS.on("tourCreate", onTournamentCreate);
    PS.on("ready", onReady);
}
