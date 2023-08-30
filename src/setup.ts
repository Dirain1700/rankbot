"use strict";

import * as fs from "node:fs";
import { createServer } from "node:http";
import * as path from "node:path";

import { parse } from "node:querystring";

import { Client as DiscordClient } from "discord.js";

import { Client as PSClient } from "./ps/client/src/Client";

const DISPLAY_HTML_PATH = "./config/index.html";
const UNCAUGHT_ERR_PATH = "./logs/uncaught";
const UNHANDLED_ERR_PATH = "./logs/unhandled";

export const SingleModulePaths = {
    activity: "./ps/client/src/Activity.js",
    psclient: "./ps/client/src/Client.js",
    clientuser: "./ps/client/src/ClientUser.js",
    message: "./ps/client/src/Message.js",
    room: "./ps/client/src/Room.js",
    user: "./ps/client/src/User.js",
    pstools: "./ps/client/src/Tools.js",
    tournament: "./ps/client/src/Tour.js",
    errors: "./ps/client/src/Error.js",
    dex: "./ps/dex.js",
    dexdata: "../data/dex/pokedex.js",
    psparser: "./ps/parser.js",
    psgame: "./ps/game.js",
    pshandler: "./ps/index.js",
    discordhandler: "./discord/index.js",
    discordparser: "./discord/parser.js",
    config: "../config/config.js",
    tools: "./Tools.js",
} as const;

export const DirectoryModulePaths = {
    pscommands: "./ps/commands",
    wordle: "./ps/wordle",
    discordcommands: "./discord/commands",
    chat: "./ps/chat",
} as const;

export function startServer() {
    createServer((req, res) => {
        if (req.method === "POST") {
            let data = "";
            req.on("data", (chunk) => {
                data += chunk;
            });
            req.on("end", () => {
                if (!data) {
                    res.end("No post data");
                    return;
                }
                const dataObject = parse(data);
                if (dataObject.type === "wake") {
                    res.end();
                    return;
                }
            });
        } else if (req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(fs.existsSync(DISPLAY_HTML_PATH) ? fs.readFileSync(DISPLAY_HTML_PATH, "utf-8") : "Service available");
        }
    }).listen(3000);
}

export function setupErrorLogger() {
    process.on("unhandledRejection", (reason) => {
        let str: string;
        if (reason instanceof Error) str = reason.stack ?? reason.toString();
        else throw reason;
        console.error(reason);
        onError("PromiseRejection", str);
    });

    process.on("uncaughtException", (err, origin) => {
        if (origin === "uncaughtException") {
            console.error(err);
            onError("NormalError", err.stack ?? err.toString());
        }
    });
}

export function onError(errType: string, err: string) {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const sec = date.getSeconds().toString().padStart(2, "0");
    const dirTime = `/${year}/${month}/${day}`;

    let dirName: string;
    let file: string;
    switch (errType) {
        case "NormalError": {
            dirName = UNCAUGHT_ERR_PATH + dirTime;
            file = dirName + `/${hour}${min}${sec}.log`;
            break;
        }

        case "PromiseRejection": {
            dirName = UNHANDLED_ERR_PATH + dirTime;
            file = dirName + `/${hour}${min}${sec}.log`;
            break;
        }
        default:
            return;
    }

    if (!dirName || !file) return;

    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });
    fs.writeFileSync(file, err);

    process.exit(1);
}

/* eslint-disable @typescript-eslint/consistent-type-imports, @typescript-eslint/no-var-requires */

export function setupGlobal() {
    global.fs = fs;
    global.path = path;
    global.Wordles = {};

    const Config = require(SingleModulePaths.config) as typeof import("../config/config");
    const { Tools } = require(SingleModulePaths.tools) as typeof import("./Tools");
    const { dex: dexData } = require(SingleModulePaths.dexdata) as typeof import("../data/dex/pokedex");
    const { Dex } = require(SingleModulePaths.dex) as typeof import("./ps/dex");
    const { PSCommandContext, PSCommandParser } = require(SingleModulePaths.psparser) as typeof import("./ps/parser");
    const { DiscordCommandContext, DiscordCommandParser } = require(SingleModulePaths.discordparser) as typeof import("./discord/parser");
    const { Rooms, Users } = require("./ps/client/src/index") as typeof import("./ps/client/src/index");

    global.Tools = Tools;
    global.Config = Config;
    global.Dex = new Dex([...Object.entries(dexData)]);
    global.Rooms = new Rooms();
    global.Users = new Users();
    global.Discord = new DiscordClient(Config.DiscordOptions);
    global.PS = new PSClient(Config.PSOptions);
    (require(SingleModulePaths.pshandler) as typeof import("./ps/index")).setEventListeners();
    (require(SingleModulePaths.discordhandler) as typeof import("./discord/index")).setEventListeners();
    global.DiscordCommandParser = new DiscordCommandParser();
    global.DiscordCommandParser.setupGlobal()
        .then((data) => {
            global.DiscordCommands = data;
        })
        .catch((e) => {
            throw e;
        });
    global.PSCommandParser = new PSCommandParser();
    void global.PSCommandParser.loadCommands();
    global.PSCommandContext = PSCommandContext;
    global.DiscordCommandContext = DiscordCommandContext;
}

export function reloadModule(modules: Array<keyof typeof SingleModulePaths | keyof typeof DirectoryModulePaths>) {
    const pscommandsIndex = modules.indexOf("pscommands");
    const psparserIndex = modules.indexOf("psparser");
    if (pscommandsIndex !== -1 && pscommandsIndex < psparserIndex) {
        modules.splice(pscommandsIndex, 1);
        modules.splice(psparserIndex + 1, 0, "pscommands");
    }
    const discordcommandsIndex = modules.indexOf("discordcommands");
    const discordparserIndex = modules.indexOf("discordparser");
    if (discordcommandsIndex !== -1 && discordcommandsIndex < discordparserIndex) {
        modules.splice(discordcommandsIndex, 1);
        modules.splice(discordparserIndex, 0, "discordcommands");
    }
    for (const m of modules) {
        if (m in SingleModulePaths) {
            const formalPath = path.resolve(__dirname, SingleModulePaths[m as keyof typeof SingleModulePaths]);
            console.log(formalPath);
            if (formalPath in require.cache) {
                delete require.cache[formalPath];
            }
        } else if (m in DirectoryModulePaths) {
            const formalPath = path.resolve(__dirname, DirectoryModulePaths[m as keyof typeof DirectoryModulePaths]);
            console.log(formalPath);
            for (const submodule of Tools.loadSubmodules(formalPath)) {
                console.log(submodule);
                if (submodule in require.cache) {
                    delete require.cache[submodule];
                }
            }
        }

        switch (m) {
            case "psparser":
            case "psgame": {
                if (!modules.includes("pscommands")) modules.push("pscommands");
                break;
            }
            case "pscommands": {
                if (!modules.includes("psparser")) {
                    const { PSCommandContext, PSCommandParser } = require(SingleModulePaths.psparser) as typeof import("./ps/parser");
                    global.PSCommandParser = new PSCommandParser();
                    global.PSCommandContext = PSCommandContext;
                }
                void global.PSCommandParser.loadCommands();
                break;
            }
            case "pshandler": {
                PS.removeAllListeners();
                (require(SingleModulePaths.pshandler) as typeof import("./ps/index")).setEventListeners();
                break;
            }
            case "dex": {
                const dexdataIndex = modules.indexOf("dexdata");
                if (!dexdataIndex || dexdataIndex < modules.indexOf("dex")) {
                    global.Dex = new (require(SingleModulePaths.dex) as typeof import("./ps/dex")).Dex([
                        ...Object.entries((require(SingleModulePaths.dexdata) as typeof import("../data/dex/pokedex")).dex),
                    ]);
                }
                break;
            }
            case "discordparser": {
                if (!modules.includes("discordcommands")) modules.push("discordcommands");
                break;
            }
            case "discordcommands": {
                if (modules.includes("discordparser")) {
                    const { DiscordCommandContext, DiscordCommandParser } = require(
                        SingleModulePaths.discordparser
                    ) as typeof import("./discord/parser");
                    global.DiscordCommandParser = new DiscordCommandParser();
                    global.DiscordCommandContext = DiscordCommandContext;
                }
                global.DiscordCommandParser.setupGlobal()
                    .then((data) => {
                        global.DiscordCommands = data;
                    })
                    .catch((e) => {
                        throw e;
                    });
                break;
            }
            case "discordhandler": {
                Discord.removeAllListeners();
                (require(SingleModulePaths.discordhandler) as typeof import("./discord/index")).setEventListeners();
                break;
            }
            case "pstools": {
                if (!modules.includes("tools")) modules.push("tools");
                break;
            }
            case "tools": {
                global.Tools = (require(SingleModulePaths.tools) as typeof import("./Tools")).Tools;
                break;
            }
            case "wordle": {
                Object.values(Wordles).forEach((w) => w.store());
                Wordles = {};
                const { Wordle } = require(path.join(DirectoryModulePaths.wordle, "/main.js")) as typeof import("./ps/wordle/main");
                Wordle.rebuild();
                break;
            }
            case "activity": {
                if (!modules.includes("tournament")) modules.push("tournament");
                if (!modules.includes("psgame")) modules.push("psgame");
                break;
            }
            case "room": {
                const { Rooms: oldRooms } = global;
                global.Rooms = new (require(SingleModulePaths.room) as typeof import("./ps/client/src/Room")).Rooms();
                for (const r of oldRooms.keys()) {
                    void global.Rooms.fetch(r);
                }
                oldRooms.raw.clear();
                oldRooms.battles.clear();
                oldRooms.clear();
                break;
            }
            case "user": {
                global.Users.raw.clear();
                global.Users.clear();
                global.Users = new (require(SingleModulePaths.user) as typeof import("./ps/client/src/User")).Users();
                break;
            }
            case "config": {
                global.Config = require(SingleModulePaths.config) as typeof import("../config/config");
                break;
            }
            case "dexdata": {
                const dexIndex = modules.indexOf("dex");
                if (!dexIndex || dexIndex < modules.indexOf("dexdata")) {
                    global.Dex = new (require(SingleModulePaths.dex) as typeof import("./ps/dex")).Dex([
                        ...Object.entries((require(SingleModulePaths.dexdata) as typeof import("../data/dex/pokedex")).dex),
                    ]);
                }
                break;
            }
        }
    }
}
