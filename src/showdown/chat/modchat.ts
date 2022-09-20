"use strict";

import type { Room, User } from "@dirain/client";

export const enableModchat = async (targetRoom: Room, targetUser: User) => {
    if (targetRoom.id !== "japanese") return;
    targetRoom = await PS.fetchRoom(targetRoom.id, false).catch(() => PS.getRoom(targetRoom.id)!);

    if (!targetRoom.modchat || !["off", "autoconfirmed"].includes(targetRoom.modchat)) return;
    const hour = new Date().getHours();
    if (hour < 13 || (hour > 22 && hour <= 23)) return;
    if (!targetRoom.isStaff(targetUser)) return;
    const users: User[] = (targetRoom.users as string[]).map((u) => PS.getUser(Tools.toId(u)) as User);
    const Staffs = users.filter((u) => targetRoom.isStaff(u) && !targetRoom.isBot(u.id) && !u.isGlobalBot);
    if (Staffs.length) {
        const isActiveStaffOnline = Staffs.some((e) => !(e.status ?? "").startsWith("!(Idle) "));
        if (isActiveStaffOnline) return;
    }
    PS.sendRoom("japanese", "/modchat +");
};

export const disableModchat = async (targetRoom: Room, targetUser: User) => {
    //if (targetRoom.id !== "japanese") return;
    if (!targetRoom.modchat || targetRoom.modchat === "autoconfirmed") return;
    targetRoom = await PS.fetchRoom(targetRoom.id, false).catch(() => PS.getRoom(targetRoom.id)!);

    const hour = new Date().getHours();
    if (hour > 13 && hour < 22) return;
    if (!targetRoom.isStaff(targetUser)) return;
    const users: User[] = (targetRoom.users as string[]).map((u) => PS.getUser(Tools.toId(u)) as User);
    const Staffs = users.filter((u) => targetRoom.isStaff(u) && !targetRoom.isBot(u.id) && !u.isGlobalBot);
    if (!Staffs.length) return;
    targetRoom.sendHTML({
        content: `<div class="infobox">Currently ModChat is set to "${targetRoom.modchat}". Do you want to set autoconfirmed?<br><button class="button" name="send" value="/msgroom japanese,/modchat ac">Set Modchat to autoconfirmed</button></div>`,
        id: "mcsuggestion",
        edit: false,
        allowedDisplay: "%",
    });
};
