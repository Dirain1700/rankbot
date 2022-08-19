"use strict";

import type { Message, ChatInputCommandInteraction, BaseInteraction } from "discord.js";

import ready from "./ready";
import ping from "./interaction/ping";
import send from "./interaction/send";
import verify from "./interaction/verify";
import ban from "./interaction/mod/ban";
import cleartext from "./interaction/mod/cleartext";
import forceban from "./interaction/mod/forceban";
import forcecleartext from "./interaction/mod/forcecleartext";
import kick from "./interaction/mod/kick";
import mute from "./interaction/mod/mute";
import unban from "./interaction/mod/unban";
import unmute from "./interaction/mod/unmute";
import apt from "./interaction/points/apt";
import clearboard from "./interaction/points/clearboard";
import hotpatch from "./interaction/hotpatch";
import rank from "./interaction/points/rank";
import rpt from "./interaction/points/rpt";
import runjs from "./message/runjs";

export default () => {
    discord.on("ready", ready);

    discord.on("messageCreate", (message: Message) => {
        if (message.content.startsWith(">runjs")) runjs(message);
    });

    discord.on("interactionCreate", (interaction: BaseInteraction): void => {
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
        let func: ((interaction: ChatInputCommandInteraction<"cached">) => void) | undefined = undefined;
        switch (interaction.commandName) {
            case "ping":
                func = ping;
                break;
            case "send":
                func = send;
                break;
            case "hotpatch":
                func = hotpatch;
                break;
            case "verify":
                func = verify;
                break;
            case "ban":
                func = ban;
                break;
            case "cleartext":
                func = cleartext;
                break;
            case "forceban":
                func = forceban;
                break;
            case "forcecleartext":
                func = forcecleartext;
                break;
            case "kick":
                func = kick;
                break;
            case "mute":
                func = mute;
                break;
            case "unban":
                func = unban;
                break;
            case "unmute":
                func = unmute;
                break;
            case "apt":
                func = apt;
                break;
            case "clearboard":
                func = clearboard;
                break;
            case "rank":
                func = rank;
                break;
            case "rpt":
                func = rpt;
                break;
        }

        if (!func) return void interaction.reply("Error: Command not found");

        func(interaction as ChatInputCommandInteraction<"cached">);
    });
};
