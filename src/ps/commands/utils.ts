"use strict";

import type { BasePSCommandDefinitions } from "../../../types/commands";

export const commands: BasePSCommandDefinitions = {
    help: {
        run(): void {
            if (this.inRoom() && !this.user.hasRank("+")) return;
            if (!Config.readme.length) {
                return this.say(`Sorry, documentation for ${BotClient.ps.user?.name ?? ""} is unavailable now!`);
            }
            this.say(`${BotClient.ps.user?.name ?? ""}'s Guide: ${Config.readme}`);
        },
        aliases: ["commands"],
    },
    invite: {
        run(): void {
            if (this.inRoom()) return;
            if (!this.argument) return this.say("Please specify the one valid room id.");
            if (!this.user.hasRank("+") && !(this.user.id in Config.developers)) return;

            this.argument = Tools.toRoomId(this.argument);
            if (!this.argument) return this.say("Please specify the one valid room id.");

            BotClient.ps.joinRoom(this.argument);
        },
        pmOnly: true,
    },
};
