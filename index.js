"use strict";

global.fs = require("fs");
global.config = require("./config/config");
global.path = require("path");
const html = fs.readFileSync("./config/index.html");
const DiscordClient = require("discord.js").Client;
const PSClient = require("ps-client").Client;

const ps = new PSClient(config.ops);
const client = new DiscordClient(config.options);
const discord = require("./discord/index");
const showdown = require("./showdown/index");
ps.pending = new Map();
discord(client, ps);
showdown(ps, client);

require("http")
    .createServer((req, res) => {
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
                const dataObject = require("querystring").parse(data);
                if (dataObject.type === "wake") {
                    res.end();
                    return;
                }
            });
        } else if (req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(html);
        }
    })
    .listen(8000);

client.login(config.token);
ps.connect();
