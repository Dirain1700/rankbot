"use strict";

import { runModchatSetter } from "../chat/modchat/enable";

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
                targetRoom = PS.getRoom(targets[0]);
                if (!targetRoom) return this.sayError("INVALID_BOT_ROOM", targets[0]);
                durationString = targets[1];
            } else {
                targetRoom = this.room as Room;
                durationString = targets[0];
            }
            if (!targetRoom.isStaff(this.user)) return;

            if (!Config.roomSettings[targetRoom.roomid]?.["modchat"])
                return this.say("Automodchat future is not enabled in " + targetRoom.title);

            if (!durationString) return this.say("Please specify the amount between 5 minutes and 120 minutes.");
            const amount = parseInt(durationString);
            if (amount < 5 || amount > 120) return this.say("Please specify the amount between 5 minutes and 120 minutes.");

            const staff = Tools.clone(this.user);
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            Config.roomSettings[targetRoom.roomid]!["modchat"]!.disabled = setTimeout(
                () => {
                    Config.roomSettings[targetRoom!.roomid]!["modchat"]!.disabled = undefined;
                    runModchatSetter(staff, targetRoom!.update());
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
};
