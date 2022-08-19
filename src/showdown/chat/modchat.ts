"use strict";

import type { Room, User } from "@dirain/client";

export default (targetRoom: Room, targetUser: User) => {
    if (targetRoom.id !== "japanese") return;
    if (new Date().getHours() < 13) return;
    if (!targetRoom.isStaff(targetUser)) return;
    const users: User[] = (targetRoom.users as string[]).map((u) => PS.getUser(Tools.toId(u)) as User);
    const isStaffOnline = users.some((u) => targetRoom.isStaff(u));
    if (isStaffOnline) return;
    PS.sendArray(["!rfaq modchat", "/modchat +"]);
};
