"use strict";

import { checkChat } from "./chat/filter";
import { storeChat, sendModlog } from "./chat/logger";
import { announceModchat } from "./chat/modchat/detect";
import { tryElevateModchatForUser } from "./chat/modchat/enable";

import { PSAPIError } from "./client/src";

import { setNextScheduledTournament } from "./scheduled-scripts";
import { onError } from "../setup";

import type { Message, ModchatLevel, Room, User } from "./client/src";

export const onMessage = (message: Message) => {
    if (message.inRoom()) {
        if (Config.roomSettings[message.target.id]) {
            checkChat(message);
            void storeChat(message);
            sendModlog(message);
        }
        if (message.author.userid === BotClient.ps.status.id) return;
        if (Config.onRoomMessage[message.target.roomid]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onRoomMessage[message.target.roomid]!.call(message);
        }
    }
    if (message.author.userid === BotClient.ps.status.id) return;
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
export const onUserRemove = (room: Room, user: User): boolean => tryElevateModchatForUser(user, room);
export const onClientRoomAdd = (room: Room) => {
    if (Config.roomSettings[room.roomid]?.scheduledTours) {
        setNextScheduledTournament(room.id);
        room.tourSetter = setInterval(() => setNextScheduledTournament(room.id), 30 * 60 * 1000); // 30 minutes
    }
};
export const onModchat = (room: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void => {
    announceModchat(room, currentModchatLevel, previousModchatLevel);
};
export const onUserRename = (NewU: User) => tryElevateModchatForUser(NewU);
export const onTournamentCreate = (room: Room) => {
    if (Config.onTournamentCreate[room.roomid] && room.tour) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Config.onTournamentCreate[room.roomid]!.call(room.tour);
    }
};
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const onReady = () => {
    console.log("Logged in as", BotClient.ps.user!.name);
};

export const onChatError = (err: string, room: Room | null) => {
    const error = new PSAPIError("CUSTOM", err + "\n" + " in room " + Tools.toString(room) + "\n at " + new Date().toUTCString());
    console.log(error.stack);
    onError("NormalError", error.stack!);
};

export const onClientError = (err: string) => {
    if (err.trim() === "error code: 522") return;
    const error = new PSAPIError("CUSTOM", err + "\n" + " at " + new Date().toUTCString());
    console.log(error.stack);
    onError("NormalError", error.stack!);
};

/* eslint-enable */
export function setEventListeners() {
    BotClient.ps.on(BotClient.ps.events.MESSAGE_CREATE, onMessage);
    BotClient.ps.on(BotClient.ps.events.ROOM_USER_ADD, onUserAdd);
    BotClient.ps.on(BotClient.ps.events.ROOM_USER_REMOVE, onUserRemove);
    BotClient.ps.on(BotClient.ps.events.CLIENT_ROOM_ADD, onClientRoomAdd);
    BotClient.ps.on(BotClient.ps.events.CHAT_ERROR, onChatError);
    BotClient.ps.on(BotClient.ps.events.CLIENT_ERROR, onClientError);
    BotClient.ps.on(BotClient.ps.events.MODCHAT, onModchat);
    BotClient.ps.on(BotClient.ps.events.USER_RENAME, onUserRename);
    BotClient.ps.on(BotClient.ps.events.TOUR_CREATE, onTournamentCreate);
    BotClient.ps.on(BotClient.ps.events.READY, onReady);
}
