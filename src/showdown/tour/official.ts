"use strict";

import type { Room } from "@dirain/client";

export const createTour = (room: Room): void => {
    let month = new String(new Date().getMonth() + 1);
    month = month.length === 1 ? "0" + month : month;
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    try {
        tourSchedule = JSON.parse(fs.readFileSync(`./src/showdown/tour/schedule/${new Date().getFullYear()}${month}.json`, "utf-8"));
    } catch (e: unknown) {
        room.send("!code " + (e as Error).toString());
        return;
    }
    if (!tourSchedule[new Date().getDate()]) return void room.send("No tournament data found.");
    const { format, name, rules } = tourSchedule[String(new Date().getDate())]!;
    if (!format) return void room.send("Data not found.");
    const command = [];
    if (format.includes("1v1")) command.push(`${room.id}|/tour new ${format}, rr`);
    else command.push(`${room.id}|/tour new ${format}, elim`);

    if (rules) command.push(`${room.id}|/tour rules ${rules.join(",")}`);
    if (name) command.push(`${room.id}|/tour name ${name}`);

    PS.sendArray(command);
};

export const announce = (room: Room): void => {
    let month = new String(new Date().getMonth() + 1);
    month = month.length === 1 ? "0" + month : month;
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    try {
        tourSchedule = JSON.parse(fs.readFileSync(`./src/showdown/tour/schedule/${new Date().getFullYear()}${month}.json`, "utf-8"));
    } catch (e: unknown) {
        room.send("!code " + (e as Error).toString());
        return;
    }
    if (!tourSchedule[new Date().getDate()]) return void room.send("No tournament data found.");
    const { format, name, rules } = tourSchedule[new Date().getDate()]!;
    room.send(`/announce 30分後から${name ?? format}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    room.send(`/announce After 30 minutes , we will open an Official Tournament in ${name ?? format}! Please join with us!`);
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) room.send(`!tier ${format}`);
    if (rules) PS.sendArray(rules.map((e) => `${room}|!tier ${e}`));
};
