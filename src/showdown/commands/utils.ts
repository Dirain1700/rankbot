"use strict";

import type { BasePSCommandDefinitions } from "../../../types/commands";

export const commands: BasePSCommandDefinitions = {
    help: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(argument, room, user): void {
            if (this.inRoom() && !this.user.hasRank("+")) return;
            this.say(`${PS.user?.name ?? ""}'s Guide: ${Config.readme}`);
        },
        aliases: ["commands"],
    },
    invite: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(argument, room, user): void {
            if (this.inRoom()) return;
            if (!argument) return this.say("Please specify the one valid room id.");
            if (!user.hasRank("+") && !(user.id in Config.developers)) return;

            argument = Tools.toRoomId(argument);
            if (!argument) return this.say("Please specify the one valid room id.");

            PS.joinRoom(argument);
        },
        pmOnly: true,
    },
};
