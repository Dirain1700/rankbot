"use strict";

import { checkTimeCondition } from "./enable";

import type { Room } from "../../client/src";

export function disableModchat(targetRoom: Room): boolean {
    if (!BotClient.ps.user || !targetRoom.checkCan("warn", BotClient.ps.user, false)) {
        return false;
    }
    if (!Config.roomSettings[targetRoom.roomid]?.modchat?.autoReset) return false;

    const currentModchatLevel = targetRoom.update().modchat;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, baseRank } = Config.roomSettings[targetRoom.roomid]!.modchat!;
    if (
        Tools.isHigherAuth(currentModchatLevel, baseRank, true) &&
        !checkTimeCondition(startTime, endTime, !!always, new Date().getHours())
    ) {
        targetRoom.setModchat(baseRank);
        return true;
    }
    return false;
}
