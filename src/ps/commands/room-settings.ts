"use strict";

import { tryElevateModchat } from "../chat/modchat/enable";
import { setNextScheduledTournament } from "../scheduled-scripts";

import type { BasePSCommandDefinitions } from "../../../types/commands";
import type { Room } from "../client/src";

export const commands: BasePSCommandDefinitions = {
    disableautomodchat: {
        run() {
            const targets = this.argument.split(",");
            let targetRoom: Room | undefined;
            let durationString: string | undefined;
            if (this.inPm()) {
                if (!targets[0]) return this.sayError("INVALID_ROOM");
                targetRoom = BotClient.ps.getRoom(targets[0]);
                if (!targetRoom) return this.sayError("INVALID_BOT_ROOM", targets[0]);
                durationString = targets[1];
            } else {
                targetRoom = this.room as Room;
                durationString = targets[0];
            }
            if (!targetRoom.isStaff(this.user)) return;

            if (!Config.roomSettings[targetRoom.roomid]?.modchat)
                return this.say("Automodchat future is not enabled in " + targetRoom.title);

            if (!durationString) return this.say("Please specify the amount between 5 minutes and 120 minutes.");
            const amount = parseInt(durationString);
            if (amount < 5 || amount > 120) return this.say("Please specify the amount between 5 minutes and 120 minutes.");

            const staff = Tools.clone(this.user);
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            Config.roomSettings[targetRoom.roomid]!.modchat!.disabled = setTimeout(
                () => {
                    Config.roomSettings[targetRoom.roomid]!.modchat!.disabled = null;
                    tryElevateModchat(staff, targetRoom.update());
                },
                amount * 60 * 1000
            );
            /* eslint-enable */

            this.say("Disabled automodchat for " + amount + " minutes.");
        },
        aliases: ["dam", "dm", "disablemodchat"],
        syntax: ["[minutes]"],
        pmSyntax: ["[room]", "[minutes]"],
    },
    reloadtournamentschedules: {
        run() {
            const targetRoom = this.inRoom() ? this.room : Rooms.get(this.argument);
            if (!targetRoom) return this.sayError("INVALID_ROOM");
            if (!targetRoom.isStaff(this.user)) return;
            const recentTournament = setNextScheduledTournament(targetRoom.id, true);
            if (!recentTournament) {
                return void this.say("Tournament schedules have been reloaded, but no tournaments scheduled today.");
            }
            this.say("Tournament schedules have been reloaded.");
            let nextMessage = "The next one will be:";
            if (recentTournament.cap) nextMessage += ` (${recentTournament.cap}-players)`;
            nextMessage += ` "${recentTournament.name ?? recentTournament.format}"`;
            if (recentTournament.rounds && recentTournament.rounds !== 1 && recentTournament.type === "Elimination") {
                const rounds = Tools.matchGenerator(recentTournament.rounds);
                nextMessage += ` (${rounds} ${recentTournament.type})`;
            }
            nextMessage += `, at ${recentTournament.time} (UTC)`;
            if (recentTournament.rules?.length) {
                nextMessage += " with the custom rules:" + Tools.joinList(recentTournament.rules);
            }
            this.say(nextMessage + ".");
        },
        aliases: ["rts"],
    },
};
