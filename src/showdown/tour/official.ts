"use strict";

import type { Room, RankHTMLBoxOptions } from "@dirain/client";

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
    const { format, name } = tourSchedule[new Date().getDate()]!;
    const messages: string[] = [];
    messages.push(`/announce 30分後から${name ?? format}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    messages.push(`/announce After 30 minutes , we will open an Official Tournament in ${name ?? format}! Please join with us!`);
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) messages.push(`!tier ${format}`);
    PS.sendArray(messages.map((e) => `${room.id}|e`);
};

export const configure = (room: Room): void => {
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
    const html: RankHTMLBoxOptions = {
        content: `今日のトーナメントの内容は以下の通りです。<br>フォーマット: ${format}<br>${name ? "名前: " + name + "<br>" : ""}${
            rules?.length ? "ルール: " + rules.join("、") + "<br>" : ""
        }<br>Raw:<br><code>${JSON.stringify(tourSchedule[new Date().getDate()]!, null, 4)}</code>`,
        edit: false,
        box: true,
        allowedDisplay: "%",
    };

    room.sendHTML(html);
};
