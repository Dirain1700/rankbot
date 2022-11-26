"use strict";

import type { Room, ClientUser } from "@dirain/client";

export default async (room: Room, format: string) => {
    if (!room.isBot((PS.user as ClientUser).id) && !room.isStaff(PS.user as ClientUser)) return;
    await Tools.sleep(PS.throttleInterval);
    if (config.tourSettings.length > 5) {
        PS.sendArray(config.tourSettings.map((e) => `${room.id}|/tour ${e}`));
    } else {
        await Tools.sleep(PS.throttleInterval);
        config.tourSettings?.forEach?.((e) => PS.sendRoom(room.id, `/tour ${e}`));
    }
    const randomized = ["random", "factory", "hackmons", "staff"];
    if (randomized.some((e) => format.includes(e))) {
        PS.sendRoom(room.id, "/tour scouting allow");
    }
};
