"use strict";

import * as querystring from "querystring";
import { Room } from "@dirain/client";
import type { RankuHTMLOptions, Message, User } from "@dirain/client";

export const createTour = (room: Room): void => {
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    try {
        tourSchedule = JSON.parse(fs.readFileSync(`./src/showdown/tour/schedule/${new Date().getFullYear()}${month}.json`, "utf-8"));
    } catch (e: unknown) {
        room.send("!code " + (e as Error).toString());
        return;
    }
    if (!tourSchedule[new Date().getDate()]) return void room.send("No tournament data found.");
    const { format, name, rules } = tourSchedule[String(new Date().getDate())] ?? {};
    if (!format) return void room.send("Data not found.");
    const command = [];
    if (format.includes("1v1")) command.push(`${room.id}|/tour new ${format}, rr`);
    else command.push(`${room.id}|/tour new ${format}, elim`);

    if (rules) command.push(`${room.id}|/tour rules ${rules.join(",")}`);
    if (name) command.push(`${room.id}|/tour name ${name}`);

    PS.sendArray(command);
};

export const announce = (room: Room): void => {
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    try {
        tourSchedule = JSON.parse(fs.readFileSync(`./src/showdown/tour/schedule/${new Date().getFullYear()}${month}.json`, "utf-8"));
    } catch (e: unknown) {
        room.send("!code " + (e as Error).toString());
        return;
    }
    if (!tourSchedule[new Date().getDate()]) return void room.send("No tournament data found.");
    const { format, name } = tourSchedule[new Date().getDate()] ?? {};
    if (!format) return void room.send("No tournament data found.");
    const messages: string[] = [];
    messages.push(`/announce 30分後から${name ?? format}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    messages.push(
        `/announce After 30 minutes, we will open an Official Tournament with the format ${name ?? format}! Please join with us!`
    );
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) messages.push(`!tier ${format}`);
    PS.sendArray(messages.map((e) => `${room.id}|${e}`));
};

export const configure = (room: Room): void => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    try {
        tourSchedule = JSON.parse(fs.readFileSync(`./src/showdown/tour/schedule/${date.getFullYear()}${month}.json`, "utf-8"));
    } catch (e: unknown) {
        room.send("!code " + (e as Error).toString());
        return;
    }
    const { format, name, rules } = tourSchedule[date.getDate()] ?? {};
    const html: RankuHTMLOptions = {
        id: "tourFormat",
        content: `<div class="infobox">今日のトーナメントの内容は以下の通りです。<br>フォーマット: ${format ? format : "undefined"}<br>${
            name ? "名前: " + name + "<br>" : ""
        }${rules?.length ? "ルール: " + rules.join("、") + "<br>" : ""}<br>Raw:<br><code>${JSON.stringify(
            tourSchedule[date.getDate()] ?? {},
            null,
            4
        )}</code><br><br><form data-submitsend="/msg ${PS.status.id},.fixTourData ${
            room.id
        } ${date.getFullYear()}${month}${date.getDate()} format&#061;{format}${rules ? "&amp;rules&#061;{rules}" : ""}${
            name ? "&amp;name&#061;{name}" : ""
        }" id="format">Format: <input type="text" id="format" name="format" value="${format ?? ""}"></input>`,
        allowedDisplay: "%",
    };

    //prettier-ignore
    const buttonHTML = "<br><button class=\"button\" type=\"submit\">Submit!</button></form></div>";
    const rulesHTML = `<br>Rules: <input type="text" id="rules" name="rules" value="${(rules ?? []).join(",")}"></input>`;
    const nameHTML = `<br>Name: <input type="text" id="name" name="name" value="${name ?? ""}"></input>`;

    if (rules && rules.length) html.content += rulesHTML;
    if (name) html.content += nameHTML;

    html.content += buttonHTML;

    room.sendHTML(html);
};

export const fixTourData = async (message: Message<User>): Promise<void> => {
    const roomid = message.content.split(" ")[1];
    if (!roomid || !config.officials.includes(roomid)) return;
    const room = await PS.fetchRoom(roomid, false).catch(
        () => new Room({ id: roomid, type: "chat", error: "not found or access denied" }, PS)
    );
    if (!room.isExist) return;
    if (!room.isStaff(message.author)) return;
    const dateString = message.content.split(" ")[2];
    if (!dateString) return void message.reply("Error: wrong args.");
    const year = dateString.substring(0, 4),
        month = dateString.substring(4, 6),
        date = dateString.substring(6, 8);
    let tourSchedule: { [day: string]: { format: string; name?: string; rules?: string[] } } = {};
    const filePath = `./src/showdown/tour/schedule/${year}${month}.json`;
    if (fs.existsSync(filePath)) {
        try {
            tourSchedule = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch (e: unknown) {
            room.send("!code " + (e as Error).toString());
            return;
        }
    }
    const rawData = message.content.split(" ").slice(3).join(" ");
    if (!rawData) return void message.reply("Error: could not fix data.");
    interface RawParsedData {
        format?: string;
        name?: string;
        rules?: string;
    }
    interface ParsedData {
        format: string;
        name?: string;
        rules?: string[];
    }
    let fixedData: RawParsedData | ParsedData = { format: "" };

    try {
        fixedData = querystring.parse(rawData);
    } catch (e: unknown) {
        message.reply("!code " + (e as Error).toString());
    }
    if (fixedData.rules) fixedData.rules = (fixedData.rules as string).split(",").map((e) => e.trim());
    let isValidData: boolean = false;
    switch (Object.keys(fixedData).length) {
        case 1:
            isValidData = typeof fixedData.format === "string" && /\[Gen \d] \w{1,}/i.test(fixedData.format);
            break;
        case 2:
            isValidData =
                typeof fixedData.format === "string" &&
                /\[Gen \d] \w{1,}/i.test(fixedData.format) &&
                [...new Set(Object.keys(fixedData)).values()][0] === "name"
                    ? typeof fixedData.name === "string"
                    : Array.isArray(fixedData.rules);
            break;
        case 3:
            isValidData =
                typeof fixedData.format === "string" &&
                /\[Gen \d] \w{1,}/i.test(fixedData.format) &&
                typeof fixedData.name === "string" &&
                Array.isArray(fixedData.rules);
            break;
        default:
            message.reply("Error occured.");
    }
    if (isValidData) {
        tourSchedule[date] = fixedData as ParsedData;
        fs.writeFileSync(filePath, JSON.stringify(tourSchedule, null, 4));
        message.reply("Successfuly fixed tournament data!");
    } else return void message.reply("!code Error occured:\n" + JSON.stringify(fixedData, null, 4));

    configure(room);
};
