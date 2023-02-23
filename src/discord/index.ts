"use strict";

import type { ChatInputCommandInteraction, BaseInteraction } from "discord.js";

import ready from "./ready";
const PING = "./interaction/ping";
const SEND = "./interaction/send";
const HOTPATCH = "./interaction/hotpatch";
const VERIFY = "./interaction/verify";
const BAN = "./interaction/mod/ban";
const CLEAR_TEXT = "./interaction/mod/cleartext";
const FORCE_BAN = "./interaction/mod/forceban";
const FORCE_CLEAR_TEXT = "./interaction/mod/forcecleartext";
const KICK = "./interaction/mod/kick";
const MUTE = "./interaction/mod/mute";
const UNBAN = "./interaction/mod/unban";
const UNMUTE = "./interaction/mod/unmute";
const APT = "./interaction/points/apt";
const CLEAR_BOARD = "./interaction/points/clearboard";
const RANK = "./interaction/points/rank";
const RPT = "./interaction/points/rpt";

export default () => {
    discord.on("ready", ready);

    discord.on("interactionCreate", async (interaction: BaseInteraction): Promise<void> => {
        if (!discord.isReady()) return;
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
        let file: string = "";
        switch (interaction.commandName) {
            case "ping":
                file = PING;
                break;
            case "send":
                file = SEND;
                break;
            case "hotpatch":
                file = HOTPATCH;
                break;
            case "verify":
                file = VERIFY;
                break;
            case "ban":
                file = BAN;
                break;
            case "cleartext":
                file = CLEAR_TEXT;
                break;
            case "forceban":
                file = FORCE_BAN;
                break;
            case "forcecleartext":
                file = FORCE_CLEAR_TEXT;
                break;
            case "kick":
                file = KICK;
                break;
            case "mute":
                file = MUTE;
                break;
            case "unban":
                file = UNBAN;
                break;
            case "unmute":
                file = UNMUTE;
                break;
            case "apt":
                file = APT;
                break;
            case "clearboard":
                file = CLEAR_BOARD;
                break;
            case "rank":
                file = RANK;
                break;
            case "rpt":
                file = RPT;
                break;
        }

        if (!file || fs.existsSync(path.resolve(__dirname, file))) return void interaction.reply("Error: Command not found");

        (await import(file)).default(interaction as ChatInputCommandInteraction<"cached">);
    });
};
