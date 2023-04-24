"use strict";

import { checkCondition } from "./enable";

import type { Room, ModchatLevel } from "@dirain/client";

export default (modchatLevel: ModchatLevel, targetRoom: Room): void => {
    if (!Config.modchatTime[targetRoom.roomid]) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, rank } = Config.modchatTime[targetRoom.roomid]!;
    if (modchatLevel === rank && checkCondition(startTime, endTime, !!always, new Date().getHours())) {
        targetRoom.send("!rfaq modchat");
    }
};
