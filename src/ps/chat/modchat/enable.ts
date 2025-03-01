"use strict";

import type { User, Room } from "../../client/src/index";

const IDLE_STATUS = "!(Idle) ";
const BUSY_STATUS = "!(Busy) ";

export default (targetUser: User, room?: Room): boolean => {
    if (room) return runModchatSetter(targetUser, room);

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

export function runModchatSetter(targetUser: User, targetRoom: Room): boolean {
    if (!Config.roomSettings[targetRoom.roomid]?.["modchat"]) return false;
    targetRoom.removeUser(targetUser.userid);
    if (!targetRoom.hasRank("%", targetUser) && !targetUser.alts.every((u) => targetRoom.hasRank("%", u))) return false;
    if (targetRoom.modchat && targetRoom.modchat !== "autoconfirmed") return false;

    /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion */
    const { startTime, endTime, always, rank, ignoreGlobals, allowBusy, allowAlts, disabled } =
        Config.roomSettings[targetRoom.roomid]!["modchat"]!;
    /* eslint-enable */
    if (!checkCondition(startTime, endTime, always, new Date().getHours())) return false;
    if (disabled) return false;
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    let isStaffOnline: boolean = false;
    targetRoom.update();
    for (const u of targetRoom.getOnlineStaffs(!!ignoreGlobals, !!allowAlts).values()) {
        u.update();
        if (u.locked) continue;
        if (ignoreGlobals) {
            if (allowAlts && u.alts.length) {
                if (u.alts.every((a) => !targetRoom.isRoomStaff(a))) continue;
            }
        } else {
            if (allowAlts && u.alts.length) {
                if (u.alts.every((a) => !Users.has(a) || !targetRoom.isStaff(Users.get(a)!))) continue;
            }
        }
        if (!u.online) continue;
        if (!u.status) {
            isStaffOnline = true;
            break;
        }
        if (u.status.startsWith(IDLE_STATUS)) continue;
        if (!allowBusy && u.status.startsWith(BUSY_STATUS)) continue;
        if (BotClient.ps.user?.userid === u.userid) continue;
        isStaffOnline = true;
        break;
    }
    if (!isStaffOnline) {
        if (!targetRoom.userCollection.size) return false;
        targetRoom.send("This room has no staffs so modchat will be set to +.");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        targetRoom.setModchat(rank || "+");
        return true;
    } else return false;
    /* eslint-enable */
}
