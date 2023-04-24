"use strict";

import type { User, Room, GroupSymbol } from "@dirain/client";

const IDLE_STATUS = "!(Idle) ";
const BUSY_STATUS = "!(Busy) ";

export default (targetUser: User, room?: Room): boolean => {
    if (room) return runModchatSetter(targetUser, room);
    else if (!targetUser.rooms.size) return false;

    let result: boolean = false;
    for (const r of targetUser.rooms.values()) {
        if (!result) result = runModchatSetter(targetUser, r);
        else runModchatSetter(targetUser, r);
    }
    return result;
};

export function checkCondition(startTime: number, endTime: number, always: boolean, time: ReturnType<Date["getHours"]>) {
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

function runModchatSetter(targetUser: User, targetRoom: Room): boolean {
    if (!Config.modchatTime[targetRoom.roomid]) return false;
    targetRoom.removeUser(targetUser.userid);
    if (!targetRoom.hasRank("%", targetUser)) return false;
    if (targetRoom.modchat && targetRoom.modchat !== "autoconfirmed") return false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { startTime, endTime, always, rank, ignoreGlobals, allowBusy } = Config.modchatTime[targetRoom.roomid]!;
    if (!checkCondition(startTime, endTime, always, new Date().getHours())) return false;
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    let isStaffOnline: boolean = false;
    for (const u of targetRoom!.getOnlineStaffs(!!ignoreGlobals).values()) {
        u.update();
        if (u.locked) continue;
        let auth: GroupSymbol;
        if (ignoreGlobals) auth = targetRoom.getRoomRank(u.userid);
        else auth = targetRoom!.getRank(u);
        if (!Tools.isHigherRank(auth, "%")) continue;
        if (auth === "*") continue;
        if (!u.online) continue;
        if (!u.status) {
            isStaffOnline = true;
            break;
        }
        if (u.status.startsWith(IDLE_STATUS)) continue;
        if (!allowBusy && u.status.startsWith(BUSY_STATUS)) continue;
        if (PS.user?.userid === u.userid) continue;
        isStaffOnline = true;
        break;
    }
    if (!isStaffOnline) {
        targetRoom.send("This room has no staffs so modchat will be set to +.");
        targetRoom.setModchat(rank || "+");
        return true;
    } else return false;
    /* eslint-enable */
}
