"use strict";

import { cloneDeep } from "lodash";
import type { Room, ClientUser } from "@dirain/client";

export default async (room: Room, format: string) => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeRoom = cloneDeep(room) as unknown as any;
    fakeRoom.client = "UwU";
    room.send(
        `/adduhtml isClientIsBotOrStaff,&lt;&lt;&nbsp;<code>room.isStaff(this.user)</code><br><code>&gt;&gt;&nbsp;${room.isStaff(
            PS.user as ClientUser
        )}</code><br><br>&lt;&lt;&nbsp;<code>room.isBot(this.user.id)</code><br><code>&gt;&gt;&nbsp;${room.isBot(
            (PS.user as ClientUser).id
        )}</code><br><br>&lt;&lt;&nbsp;<code>client.rooms.cache.get("japanese");</code><br><pre><code>&gt;&gt;&nbsp;${JSON.stringify(
            fakeRoom,
            null,
            4
        )}</code></pre>`
    );
    if (!room.isBot((PS.user as ClientUser).id) && !room.isStaff(PS.user as ClientUser)) return;
    await Tools.sleep(PS.messageInterval);
    if (config.tourSettings.length > 5) {
        PS.sendArray(config.tourSettings.map((e) => `${room.id}|/tour ${e}`));
    } else {
        await Tools.sleep(PS.messageInterval);
        config.tourSettings?.forEach?.((e) => PS.sendRoom(room.id, `/tour ${e}`));
    }
    const randomized = ["random", "factory", "hackmons", "staff"];
    if (randomized.some((e) => format.includes(e))) {
        PS.sendRoom(room.id, "/tour scouting allow");
    }
};
