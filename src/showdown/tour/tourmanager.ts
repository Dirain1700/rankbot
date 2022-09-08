"use strict";

import type { Room } from "@dirain/client";

export default async (room: Room, format: string) => {
    if (!room.id.includes("japanese")) return;
    if (config.tourSettings.length > 5) {
        PS.sendArray(config.tourSettings.map((e) => `${room.id}|/tour ${e}`));
    } else {
        await Tools.sleep(PS.messageInterval);
        config.tourSettings?.forEach?.((e) => PS.sendRoom(room.id, `/tour ${e}`));
    }
    const randomized = ["random", "factory", "hackmons", "staff"];
    if (randomized.some((e) => format.includes(e))) {
        await Tools.sleep(PS.messageInterval);
        PS.sendRoom(room.id, "/tour scouting allow");
    }
};
