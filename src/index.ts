///<reference types="../types/global"/>

process.exit();
import * as fs from "fs";
import * as path from "path";
import { createServer } from "http";
import * as config from "../config/config";
import { Tools } from "./Tools";
import { parse } from "querystring";
import { Collection, Client as disClient } from "discord.js";
import { Client as PSC } from "@dirain/client";
import { dex } from "../data/dex/pokedex";
import { CommandParser as PSCommandParser, CommandContext } from "./showdown/parser";

global.fs = fs;
global.Config = config;
global.path = path;
global.Tools = Tools;
global.Wordles = {};
global.Dex = new Collection([...Object.entries(dex)]);
global.Commands = {};
global.PSCommandParser = new PSCommandParser();
global.CommandContext = CommandContext;

global.PSCommandParser.loadCommands();
const html = fs.readFileSync("./config/index.html", "utf-8");

export const PSClient = new PSC(config.PSOptions);
export const DiscordClient = new disClient(config.DiscordOptions);

global.PS = PSClient;
global.discord = DiscordClient;

import discordHandler from "./discord/index";
import PShandler from "./showdown/index";

global.pendingVerification = new Map();
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

DiscordClient.login(process.env.DISCORD as string);
PSClient.connect();

const UNCAUGHT_ERR_PATH = "./logs/uncaught";
const UNHANDLED_ERR_PATH = "./logs/unhandled";

process.on("unhandledRejection", (reason) => {
    let str: string;
    if (reason instanceof Error) str = reason.stack ?? reason.toString();
    else throw reason;
    onError("PromiseRejection", str);
    console.error(reason);
});

process.on("uncaughtException", (err, origin) => {
    if (origin === "uncaughtException") onError("NormalError", err.stack ?? err.toString());
    console.error(err);
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
