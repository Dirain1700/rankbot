"use strict";

import { User } from "@dirain/client";
import { scheduleJob } from "node-schedule";

import announceModchat from "./chat/modchat/detect";
import enableModchat from "./chat/modchat/enable";
import { CommandContext } from "./parser";

import type { Message, ModchatLevel, Room } from "@dirain/client";

export default () => {
    PS.on("messageCreate", (message: Message) => {
        if (message.author.userid === PS.status.id) return;
        PSCommandParser.parse(message);
        if (message.inRoom() && Config.onRoomMessage[message.target.roomid]) {
            Config.onRoomMessage[message.target.roomid]!.call(message);
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

        const developer = new User(
            {
                id: Config.developers[0],
                userid: Config.developers[0],
                name: Config.developers[0],
                rooms: false,
                group: "%",
            },
            PS
        );

        scheduleJob("0 0 23 * * *", () => {
            new CommandContext("wordle", "wordle", "create", PS.user!, developer, 0).run();
        });

        scheduleJob("0 0 14 * * *", () => {
            new CommandContext("wordle", "wordle", "commend", PS.user!, developer, 0).run();
        });
        setTimeout(() => {
            new CommandContext("wordle", "wordle", "restore", PS.user!, developer, 0).run();
        }, 3 * 1000);
    });

    /* eslint-enable */
};
