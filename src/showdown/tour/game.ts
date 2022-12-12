"use strict";

import type { Message, Room } from "@dirain/client";
import type { TourDataType } from "./official";

export const Game = {
    "Same Solo": {
        Pokemon: 1,
        tier: "[Gen 8] 1v1",
    },
    "Same Duo": {
        Pokemon: 2,
        tier: "[Gen 8] 2v2 Doubles",
    },
    "Same Six": {
        Pokemon: 6,
        tier: "[Gen 8] OU",
    },
};

export const rerollPokemon = (message: Message<Room>): void => {
    const { target: room } = message;
    if (!message.client.user || !room.isStaff(message.client.user)) return;
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const filePath = path.resolve(__dirname, `./schedule/${new Date().getFullYear}${month}.json`);
    if (!fs.existsSync(filePath)) return void room.send("Tournament data not found");
    const tourSchedule: TourDataType = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!tourSchedule[new Date().getDate()]) return void room.send("No tournament data found.");
    const { game, rules } = tourSchedule[new Date().getDate()] ?? {};
    if (!game) return void room.send("No tournament data found.");
    const mons = Dex.random(Game[game].Pokemon).map((e) => e.name);
    const newRule = rules ?? [];
    newRule.push("-All Pokemon");
    mons.forEach((e) => newRule.push("+" + e));
    room.send(`/announce Rerolled Pokémons: ${mons.length > 1 ? mons.slice(-1).join(", ") + " and " + mons.at(-1) : mons[0]}`);
    room.send(`/tour rules ${newRule.join(",")}`);
};
