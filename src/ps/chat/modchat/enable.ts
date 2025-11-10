"use strict";

import type { User, Room } from "../../client/src/index";

const IDLE_STATUS = "!(Idle) ";
const BUSY_STATUS = "!(Busy) ";

export function tryElevateModchatForUser(targetUser: User, room?: Room): boolean {
    if (room) return tryElevateModchat(targetUser, room);

    let result: boolean = false;
    for (const r of targetUser.rooms.values()) {
        result ||= tryElevateModchat(targetUser, r);
    }
    return result;
}

export function checkTimeCondition(startTime: number, endTime: number, always: boolean, time: ReturnType<Date["getHours"]>) {
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

function isStaffOnline(targetRoom: Room): boolean {
    const { ignoreGlobals, allowBusy, allowAlts } = Config.roomSettings[targetRoom.roomid]?.["modchat"] || {};
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
                const hasAltStaff = u.alts.some((a) => {
                    const altUser = Users.get(a);
                    return altUser && targetRoom.isStaff(altUser);
                });
                if (!hasAltStaff) continue;
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
    return isStaffOnline;
}

export function tryElevateModchat(targetUser: User, targetRoom: Room): boolean {
    if (!Config.roomSettings[targetRoom.roomid]?.["modchat"]) return false;
    targetRoom.removeUser(targetUser.userid);
    if (!targetRoom.hasRank("%", targetUser) && !targetUser.alts.every((u) => targetRoom.hasRank("%", u))) return false;
    if (targetRoom.modchat && targetRoom.modchat !== "autoconfirmed") return false;

    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    const { startTime, endTime, always, rank, disabled } = Config.roomSettings[targetRoom.roomid]!["modchat"]!;
    /* eslint-enable */
    if (!checkTimeCondition(startTime, endTime, always, new Date().getHours())) return false;
    if (disabled) return false;

    if (!isStaffOnline) {
        if (!targetRoom.userCollection.size) return false;
        targetRoom.send("This room has no staffs so modchat will be set to +.");

        targetRoom.setModchat(rank || "+");
        return true;
    } else return false;
}
