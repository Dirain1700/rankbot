"use strict";

import { disableModchat } from "./disable";
import { checkTimeCondition } from "./enable";

import type { Room, ModchatLevel } from "../../client/src";

export function announceModchat(targetRoom: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void {
    if (!Config.roomSettings[targetRoom.roomid]?.["modchat"]) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, elevatedRank, announce } = Config.roomSettings[targetRoom.roomid]!["modchat"]!;
    if (
        announce &&
        currentModchatLevel === elevatedRank &&
        checkTimeCondition(startTime, endTime, !!always, new Date().getHours()) &&
        Tools.isHigherAuth(currentModchatLevel, previousModchatLevel)
    ) {
        setModchatResetTimer(targetRoom);
        for (const line of announce) {
            targetRoom.send(line);
        }
    }
}

function setModchatResetTimer(targetRoom: Room): void {
    if (!Config.roomSettings[targetRoom.roomid]?.["modchat"]?.["autoReset"]) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, elevatedRank } = Config.roomSettings[targetRoom.roomid]!["modchat"]!;

    targetRoom.update();
    const now = new Date();
    if (targetRoom.modchat !== elevatedRank || !checkTimeCondition(startTime, endTime, !!always, now.getHours())) return;
    if (always) return;

    // Only calculate the reset date when the current time is between startTime and endTime.
    // Otherwise return. The earlier early-return already guarantees the current time is in range,
    // so no duplicate check is necessary here.

    // Create a Date for the next occurrence of endTime and add 100ms.
    const resetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime, 0, 0, 100);
    // If the computed resetDate is <= now, roll it over to the next day.
    if (resetDate <= now) resetDate.setDate(resetDate.getDate() + 1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Config.roomSettings[targetRoom.roomid]!["modchat"]!["timeout"] = setTimeout(() => {
        disableModchat(targetRoom);
    });
}
