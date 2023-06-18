"use strict";

import { checkCondition } from "./enable";

import type { Room, ModchatLevel } from "@dirain/client";

export default (targetRoom: Room, currentModchatLevel: ModchatLevel, previousModchatLevel: ModchatLevel): void => {
    if (!Config.modchatTime[targetRoom.roomid]) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, rank, showRfaq } = Config.modchatTime[targetRoom.roomid]!;
    if (showRfaq && currentModchatLevel === rank && checkCondition(startTime, endTime, !!always, new Date().getHours()) && Tools.isHigherAuth(currentModchatLevel, previousModchatLevel)) {
        targetRoom.send("!rfaq modchat");
    }
};
