///<reference types="../types/global"/>

import * as fs from "fs";
import { createServer } from "http";
import * as path from "path";

import { parse } from "querystring";

import { Client as PSC } from "@dirain/client";
import { Collection, Client as disClient } from "discord.js";

import { Tools } from "./Tools";

import discordHandler from "./discord/index";
import { DiscordCommandParser, DiscordCommandContext } from "./discord/parser";
import PShandler from "./showdown/index";
import { PSCommandParser, PSCommandContext } from "./showdown/parser";
import * as config from "../config/config";
import { dex } from "../data/dex/pokedex";

global.fs = fs;
global.Config = config;
global.path = path;
global.Tools = Tools;
global.Wordles = {};
global.Dex = new Collection([...Object.entries(dex)]);
global.DiscordCommandParser = new DiscordCommandParser();
global.DiscordCommandContext = DiscordCommandContext;
global.PSCommands = {};
global.PSCommandParser = new PSCommandParser();
global.PSCommandContext = PSCommandContext;

global.DiscordCommandParser.setupGlobal()
    .then((data) => {
        global.DiscordCommands = data;
    })
    .catch(console.error);
void global.PSCommandParser.loadCommands();
const html = fs.readFileSync("./config/index.html", "utf-8");

export const PSClient = new PSC(config.PSOptions);
export const DiscordClient = new disClient(config.DiscordOptions);

global.PS = PSClient;
global.discord = DiscordClient;

discordHandler();
PShandler();

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
        res.end(html);
    }
}).listen(3000);

void DiscordClient.login(process.env.DISCORD as string);
// PSClient.connect();

const UNCAUGHT_ERR_PATH = "./logs/uncaught";
const UNHANDLED_ERR_PATH = "./logs/unhandled";

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

function onError(errType: string, err: string) {
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
