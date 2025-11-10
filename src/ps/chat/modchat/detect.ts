"use strict";

import { checkTimeCondition } from "./enable";

import type { Room, ModchatLevel } from "../../client/src";

export function announceModchat(targetRoom: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void {
    if (!Config.roomSettings[targetRoom.roomid]?.["modchat"]) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, rank, showRfaq } = Config.roomSettings[targetRoom.roomid]!["modchat"]!;
    if (
        showRfaq &&
        currentModchatLevel === rank &&
        checkTimeCondition(startTime, endTime, !!always, new Date().getHours()) &&
        Tools.isHigherAuth(currentModchatLevel, previousModchatLevel)
    ) {
        targetRoom.send("!rfaq modchat");
    }
}
