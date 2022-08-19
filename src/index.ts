"use strict";

import "../types/global";

import * as fs from "fs";
import { createServer } from "http";
import { config } from "../config/config";
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

DiscordClient.login();
PSClient.connect();
