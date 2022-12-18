"use strict";

import * as querystring from "querystring";
import { Room } from "@dirain/client";
import { format } from "prettier";
import { Game } from "./game";

import type { RankuHTMLOptions, Message, User } from "@dirain/client";

export const Games = ["Same Solo", "Same Duo", "Same Six"] as const;

type GameTypes = typeof Games[number] | false;

export interface TourDataType {
    [day: string]: {
        type: "Game" | "Tour";
        format: string;
        game?: GameTypes | false;
        name?: string;
        rules?: string[];
    };
}

export const createTour = async (room: Room): Promise<void> => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const filePath = `./schedule/${date.getFullYear()}${month}`;
    if (!fs.existsSync(path.resolve(__dirname, filePath) + ".js")) return void room.send("Tournament data not found");
    const { TourSchedule } = await import(filePath);

    if (!TourSchedule[date.getDate()]) return void room.send("No tournament data found.");
    const { type, game, format, name, rules } = TourSchedule[date.getDate()] ?? {};
    if (!format || !type) return void room.send("Data not found.");
    const command = [];
    if (format.includes("1v1")) command.push(`${room.id}|/tour new ${format}, rr`);
    else command.push(`${room.id}|/tour new ${format}, elim`);

    if (game) {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const mons = Dex.random(Game[game as typeof Games[number]].Pokemon).map((e) => e.name);
        const boldMons = mons.map((e) => "**" + e + "**");

        const gameRules: string[] = rules ?? [];
        gameRules.push("-All Pokemon");
        mons.forEach((e) => gameRules.push("+" + e));

        command.push(`${room.id}|/tour rules ${gameRules.join(",")}`);
        command.push(`${room.id}|/tour name ${game}`);

        command.push(
            `${room.id}|/announce This is ${game} tournament! Only these ${mons.length} Pokémons allowed: ${
                mons.length > 1 ? boldMons.slice(-1).join(", ") + " and " + boldMons.at(-1) : boldMons[0]
            }`
        );
        /* eslint-enable */
    } else {
        if (rules) command.push(`${room.id}|/tour rules ${rules.join(",")}`);
        if (name) command.push(`${room.id}|/tour name ${name}`);
    }

    PS.sendArray(command);
};

export const announce = async (room: Room): Promise<void> => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const filePath = `./schedule/${date.getFullYear()}${month}`;
    if (!fs.existsSync(path.resolve(__dirname, filePath) + ".js")) return void room.send("Tournament data not found");
    const { TourSchedule } = await import(filePath);

    if (!TourSchedule[date.getDate()]) return void room.send("No tournament data found.");
    const { format, name, game } = TourSchedule[date.getDate()] ?? {};
    if (!format) return void room.send("No tournament data found.");
    const messages: string[] = [];
    if (game) {
        messages.push(`/announce 30分後に${game}トーナメントを開催します! 使用できるポケモンはあとで発表します!`);
        messages.push(`/announce After 30mins, we will hold an Official Game: ${game}! Available Pokémon will be announced later.`);
    } else {
        messages.push(`/announce 30分後に${name ?? format}のOfficial Tournamentを開催します!`);
        messages.push(`/announce After 30mins, we will hold an Official Tournament with the format ${name ?? format}.`);
    }

    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) messages.push(`!tier ${format}`);
    PS.sendArray(messages.map((e) => `${room.id}|${e}`));
};

export const configure = async (room: Room, tourType?: "Game" | "Tour"): Promise<void> => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const filePath = `./schedule/${new Date().getFullYear()}${month}`;
    if (!fs.existsSync(path.resolve(__dirname, filePath) + ".js")) return void room.send("Tournament data not found");
    const { TourSchedule } = await import(filePath);

    const { type, format, name, rules } = TourSchedule[date.getDate()] ?? {};
    const html: RankuHTMLOptions = {
        id: "tourFormat",
        content: `<div class="infobox">今日のトーナメントの内容は以下の通りです。<br>Type: ${type}フォーマット: ${format}<br>${
            name ? "名前: " + name + "<br>" : ""
        }${rules?.length ? "ルール: " + rules.join("、") + "<br>" : ""}<br>Raw:<br><code>${JSON.stringify(
            TourSchedule[date.getDate()] ?? {},
            null,
            4
        )}</code><br><br><b>Choose game mode</b>:<form data-submitsend="/botmsg ${PS.status.id},.selectTourType ${
            room.id
        } ${date.getFullYear()}${month}${date.getDate()} type&#061;{type}">Type: <select id="type" name="type"><option value="Tour" ${
            tourType || type === "Tour" ? "selected" : ""
        }>Tour</option><option value="Game" ${
            tourType || type === "Game" ? "selected" : ""
        }>Game</option></select><br><br><button class="button" type="submit">Submit game mode</button></form>`,
        allowedDisplay: "%",
    };

    const TourForm = `<div class="infobox"><br><br><b>Choose formats:</b><form data-submitsend="/botmsg ${PS.status.id},.fixTourData ${
        room.id
    } ${date.getFullYear()}${month}${date.getDate()} type&#061;Tour&amp;format&#061;{format}"&amp;rules&#061;{rules}&amp;name&#061;{name}"
    }">Format: <input type="text" id="format" name="format" value="${
        format ?? ""
    }"></input><br>Rules: <input type="text" id="rules" name="rules" value="${(rules ?? []).join(
        ","
    )}"></input><br>Name: <input type="text" id="name" name="name" value="${
        name ?? ""
    }"></input><br><button class="button" type="submit">Submit!</button></form></div>`;

    const GameForm = `<div class="infobox"><br><br><b>Choose formats:</b><form data-submitsend="/botmsg ${PS.status.id},.fixTourData ${
        room.id
    } ${date.getFullYear()}${month}${date.getDate()} type&#061;Game&amp;game&#061;{game}">Game: <select id="game" name="game">${Games.map(
        (e) => `<option value=${e}${name === e ? "selected" : ""}>${e}</option>`
    )}</select><br><button class="button" type="submit">Submit!</button></form></div>`;

    if (tourType === "Tour") html.content += TourForm;
    else if (tourType === "Game") html.content += GameForm;

    html.content += "</div>";

    if (tourType) {
        room.send("/privatesenduhtml tourFormat," + html.content);
        html.content = html.content.replaceAll(">Submit", " disabled>Submit");
    }
    room.send(`/addrankuhtml ${html.allowedDisplay},${html.id},${html.content}`);
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
    const filePath = `./schedule/${year}${month}`;
    if (!fs.existsSync(path.resolve(__dirname, filePath) + ".js")) return void room.send("Tournament data not found");
    const { TourSchedule } = await import(filePath);

    const rawData = message.content.split(" ").slice(3).join(" ");
    if (!rawData) return void message.reply("Error: could not fix data.");
    interface RawParsedData {
        type?: string;
        format?: string;
        game?: string;
        name?: string;
        rules?: string;
    }
    type ParsedData = {
        type: "Tour" | "Game";
        format: string;
        game?: (string & GameTypes) | false;
        name?: string;
        rules?: string[];
    };

    let fixedData: RawParsedData | ParsedData = { type: "Tour", format: "" };

    try {
        fixedData = querystring.parse(rawData) as RawParsedData as ParsedData;
    } catch (e: unknown) {
        message.reply("!code " + (e as Error).toString());
    }
    if (!fixedData.type || !["Tour", "Game"].includes(fixedData.type)) return void message.reply("Invalid Syntax.");
    if (fixedData.rules) fixedData.rules = (fixedData.rules as string).split(",").map((e) => e.trim());
    let isValidData: boolean = false;
    if (fixedData.type === "Tour") {
        switch (Object.keys(fixedData).length) {
            case 2:
                isValidData = typeof fixedData.format === "string" && /\[Gen \d] \w{1,}/i.test(fixedData.format);
                break;
            case 3:
                isValidData =
                    typeof fixedData.format === "string" &&
                    /\[Gen \d] \w{1,}/i.test(fixedData.format) &&
                    [...new Set(Object.keys(fixedData)).values()][0] === "name"
                        ? typeof fixedData.name === "string"
                        : Array.isArray(fixedData.rules);
                break;
            case 4:
                isValidData =
                    typeof fixedData.format === "string" &&
                    /\[Gen \d] \w{1,}/i.test(fixedData.format) &&
                    typeof fixedData.name === "string" &&
                    Array.isArray(fixedData.rules);
                break;
        }
    } else if (fixedData.type === "Game") {
        if (!fixedData.game) return;
        switch (Object.keys(fixedData).length) {
            case 2:
                isValidData = Games.includes(fixedData.game as string as typeof Games[number]);
                break;
            case 4:
                isValidData =
                    Games.includes(fixedData.game as string as typeof Games[number]) && !!fixedData.rules && Array.isArray(fixedData.rules);
                break;
        }
    }
    if (isValidData) {
        if (fixedData.type === "Game") {
            switch (fixedData.game) {
                case "Same Solo":
                    fixedData.format = "[Gen 8] 1v1";
                    fixedData.name = "Same Solo";
                    break;
                case "Same Duo":
                    fixedData.format = "[Gen 8] 2v2 Doubles";
                    fixedData.name = "Same Duo";
                    break;
                case "Same Six":
                    fixedData.format = "[Gen 8] OU";
                    fixedData.name = "Same Six";
                    break;
            }
        } else fixedData.game = false;
        TourSchedule[date] = fixedData as ParsedData;
        const prettierSet = JSON.parse(fs.readFileSync("./.prettierrc.json", "utf-8"));
        // prettier-ignore
        const string = format(
            "import type {TourDataType} from \"../official\";export const TourSchedule:TourDataType=" + JSON.stringify(TourSchedule, null, 4),
            Object.assign({ parser: "typescript" }, prettierSet)
        );
        fs.writeFileSync(filePath, string);
        message.reply("Successfuly fixed tournament data!");
    } else return void message.reply("!code Error occured:\n" + JSON.stringify(fixedData, null, 4));

    configure(room);
};

export const setType = async (message: Message<User>): Promise<void> => {
    const roomid = message.content.split(" ")[1];
    if (!roomid || !config.officials.includes(roomid)) return;
    const room = await PS.fetchRoom(roomid, false).catch(
        () => new Room({ id: roomid, type: "chat", error: "not found or access denied" }, PS)
    );
    if (!room.isExist) return;
    if (!room.isStaff(message.author)) return;

    const rawData = message.content.split(" ").slice(3).join(" ");
    if (!rawData) return void message.reply("Error: could not fix data.");
    interface ParsedData {
        type?: "Game" | "Tour";
    }
    let fixedData: ParsedData = { type: "Tour" };

    try {
        fixedData = querystring.parse(rawData);
    } catch (e: unknown) {
        message.reply("!code " + (e as Error).toString());
    }
    if (!fixedData.type || !["Tour", "Game"].includes(fixedData.type)) return void message.reply("Error: could not fix data.");

    configure(room, fixedData.type);
};
