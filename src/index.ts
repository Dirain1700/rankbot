///<reference types="../types/global"/>

import * as fs from "fs";
import { createServer } from "http";
import * as config from "../config/config";
import { Tools } from "@dirain/client";
import { parse } from "querystring";

global.fs = fs;
global.config = config;
global.path = require("path");
global.Tools = Tools;

import { Client as disClient } from "discord.js";
import { Client as PSC } from "@dirain/client";

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

process.on("uncaughtException", (err, origin) => {
    const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() > 8 ? String(date.getMonth() + 1) : "0" + String(date.getMonth() + 1);
    const day = date.getDate() > 9 ? String(date.getDate()) : "0" + String(date.getDate());
    const hour = date.getHours() > 9 ? String(date.getHours()) : "0" + String(date.getHours());
    const min = date.getMinutes() > 9 ? String(date.getMinutes()) : "0" + String(date.getMinutes());
    const sec = date.getSeconds() > 9 ? String(date.getSeconds()) : "0" + String(date.getSeconds());
    const dirTime = `/${year}/${month}/${day}`;
    if (origin === "uncaughtException") {
        const dirName = UNCAUGHT_ERR_PATH + dirTime;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });
        const file = dirName + `/${hour}${min}${sec}.log`;

        fs.writeFileSync(file, err.stack ?? err.toString());
    } else if (origin === "unhandledRejection") {
        const dirName = UNHANDLED_ERR_PATH + dirTime;
        if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });
        const file = dirName + `/${hour}${min}${sec}.log`;

        fs.writeFileSync(file, err.stack ?? err.toString());
    }

    process.exit(1);
});
