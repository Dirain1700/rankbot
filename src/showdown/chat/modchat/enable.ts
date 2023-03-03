"use strict";

import type { User, Room, GroupSymbol } from "@dirain/client";

const IDLE_STATUS = "!(Idle) ";
const BUSY_STATUS = "!(Busy) ";

export default async (targetUser: User, room?: Room) => {
    if (room) return runModchatSetter(targetUser, room.roomid);
    else if (!targetUser.rooms) return;

    for (const r of Object.keys(targetUser.rooms).map(Tools.toRoomId)) {
        runModchatSetter(targetUser, r);
    }
};

function checkCondition(startTime: number, endTime: number, always: boolean, time: number) {
    if (always) return true;
    if (startTime === endTime) return true;
    if (startTime > endTime) {
        if (time >= startTime || time <= endTime) return true;
        else return false;
    } else {
        if (time < startTime || time >= endTime) return false;
        else return true;
    }
}

async function runModchatSetter(targetUser: User, r: string): Promise<void> {
    if (!Config.modchatTime[r]) return;
    const targetRoom: Room | undefined = PS.rooms.cache.get(r);
    if (!targetRoom) return;
    targetRoom.removeUser(targetUser.userid);
    if (!targetRoom.hasRank("%", targetUser)) return;
    if (targetRoom.modchat && targetRoom.modchat !== "autoconfirmed") return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, rank, ignoreGlobals, allowBusy } = Config.modchatTime[r]!;
    if (!checkCondition(startTime, endTime, always, new Date().getHours())) return;
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const staffs = targetRoom!.users.filter(async (u: string) => {
        let auth: GroupSymbol = " ";
        if (ignoreGlobals) auth = targetRoom.getRoomRank(u);
        else auth = targetRoom!.getRank(u);
        if (!Tools.isHigherRank(auth, "%")) return false;
        if (auth === "*") return false;
        let user = PS.getUser(u);
        if (!user) user = await PS.fetchUser(u);
        if (!user.online) return false;
        if (!user.status) return true;
        if (user.status.startsWith(IDLE_STATUS)) return false;
        if (!allowBusy && user.status.startsWith(BUSY_STATUS)) return false;
        if (PS.user?.userid === user.userid) return false;
        return true;
    });
    if (!staffs.length) {
        targetRoom.send("This room has no staffs so modchat will be set to +.");
        targetRoom!.setModchat(rank || "+");
    }
    /* eslint-enable */
}
