"use strict";

import type { User, Room, GroupSymbol } from "@dirain/client";

const IDLE_STATUS = "!(Idle) ";
const BUSY_STATUS = "!(Busy) ";

export default async (targetUser: User) => {
    if (!targetUser.rooms) return;

    for (const r of Object.keys(targetUser.rooms)) {
        if (!Config.modchatTime[r]) continue;
        let targetRoom: Room | undefined = PS.rooms.cache.get(r);
        if (!targetRoom) continue;
        if (!targetRoom.hasRank("%", targetUser)) continue;
        if (!targetRoom.modchat || targetRoom.modchat !== "autoconfirmed") continue;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { startTime, endTime, always, rank, ignoreGlobals, allowBusy } = Config.modchatTime[r]!;
        if (!always && new Date().getHours() < startTime && new Date().getHours() > endTime) continue;
        if (!targetRoom.users) targetRoom.send("/modchat " + (rank || "+"));
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        targetRoom = await PS.rooms.fetch(targetRoom.id);
        const staffs = targetRoom!.users.filter((u: string) => {
            let auth: GroupSymbol = " ";
            if (ignoreGlobals) auth = targetRoom!.getRoomRank(u);
            else auth = targetRoom!.getRank(u);
            if (!Tools.isHigherRank(auth, "%")) return false;
            const user = PS.getUser(u);
            if (!user) return false;
            if (!user.status) return true;
            if (user.status.startsWith(IDLE_STATUS)) return false;
            if (!allowBusy && user.status.startsWith(BUSY_STATUS)) return false;
            return true;
        });
        if (!staffs.length) targetRoom!.send("/modchat " + (rank || "+"));
        /* eslint-enable */
    }
};
