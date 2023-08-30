"use strict";

import { scheduleJob } from "node-schedule";

import checkChat from "./chat/filter";
import { storeChat, sendModlog } from "./chat/logger";
import announceModchat from "./chat/modchat/detect";
import enableModchat from "./chat/modchat/enable";
import { User } from "./client/src";
import { PSCommandContext } from "./parser";
import { Wordle } from "./wordle/main";

import type { Message, ModchatLevel, Room } from "./client/src";

PS.on("messageCreate", (message: Message) => {
    if (message.author.userid === PS.status.id) return;
    PSCommandParser.parse(message);
    if (message.inRoom()) {
        if (Config.onRoomMessage[message.target.roomid]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onRoomMessage[message.target.roomid]!.call(message);
        }
        if (Config.enableStretchFilter.includes(message.target.roomid)) {
            checkChat(message);
        }
        if (message.target.roomid in Config.logChannels) {
            storeChat(message);
            sendModlog(message);
        }
    }
});

PS.on("roomUserAdd", (room: Room, user: User): void => {
    if (user.id in Config.onUserJoin) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const runtimeData = Config.onUserJoin[user.id]!;
        if (Date.now() - runtimeData.lastTime >= runtimeData.cooldown) {
            runtimeData.run.call(user);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Config.onUserJoin[user.id]!.lastTime = Date.now();
        }
    }
});
PS.on("roomUserRemove", (room: Room, user: User): boolean => enableModchat(user, room));

PS.on("chatError", (e) => console.log(e));
PS.on("error", (e) => console.log(e));

PS.on("modchat", (room: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void => {
    announceModchat(room, currentModchatLevel, previousModchatLevel);
});

PS.on("userRename", (NewU) => {
    enableModchat(NewU);
});

PS.on("tourCreate", (room) => {
    if (Config.onTournamentCreate[room.roomid] && room.tour) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Config.onTournamentCreate[room.roomid]!.call(room.tour);
    }
});

/* eslint-disable @typescript-eslint/no-non-null-assertion */

PS.on("ready", () => {
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
});

/* eslint-enable */
