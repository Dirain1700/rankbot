"use strict";

import type { Room, User } from "@dirain/client";

export default async (targetRoom: Room, targetUser: User) => {
    targetRoom = await PS.fetchRoom(targetRoom.id, false).catch(() => PS.getRoom(targetRoom.id)!);
    if (targetRoom.id !== "japanese") return;

    if (new Date().getHours() < 13) return;
    if (!targetRoom.isStaff(targetUser)) return;
    const users: User[] = (targetRoom.users as string[]).map((u) => PS.getUser(Tools.toId(u)) as User);
    const isStaffOnline = users.some((u) => targetRoom.isStaff(u));
    console.log(isStaffOnline);
    if (isStaffOnline) return;
    PS.sendRoom("japanese", "/modchat +");
};
