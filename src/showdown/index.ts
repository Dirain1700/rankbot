"use strict";

import { scheduleJob } from "node-schedule";
import { Room, User } from "@dirain/client";
import type { Message } from "@dirain/client";

import enableModchat from "./chat/modchat/enable";
import announceModchat from "./chat/modchat/detect";
import { CommandContext } from "./parser";

export default () => {
    PS.on("messageCreate", (message: Message) => {
        if (message.author.userid === PS.status.id) return;
        PSCommandParser.parse(message);
    });

    PS.on("roomUserRemove", (room: Room, user: User): boolean => enableModchat(user, room));

    PS.on("chatError", (e) => console.log(e));
    PS.on("error", (e) => console.log(e));

    PS.on("rawData", (message: string, room: Room): void => {
        announceModchat(message, room);
    });

    PS.on("userRename", (NewU) => {
        enableModchat(NewU);
    });

    PS.on("tourCreate", (room) => {
        if (!Config.onTournamentCreate[room.roomid] || !room.tour) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Config.onTournamentCreate[room.roomid]!.call(room.tour);
    });

    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    PS.on("ready", async () => {
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
