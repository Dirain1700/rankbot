import { GatewayIntentBits } from "discord.js";
import type { ClientOptions as DiscordClientOptions, Snowflake } from "discord.js";
import type { ClientOptions as PSClientOptions } from "@dirain/client";

import type { ModchatSetting } from "../types/config";
import type { Dict } from "../types/utils";

const { Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans } = GatewayIntentBits;

export const DiscordOptions: DiscordClientOptions = {
    intents: [Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans],
};
export const PSOptions: PSClientOptions = {
    name: "",
    pass: "",
    avatar: "",
    status: "",
    autoJoin: [],
};
export const modchatTime: Dict<ModchatSetting> = {};
export const commandPrefix = "";
export const readme = "";
export const enableStretchFilter: string[] = [];
export const testCh: Snowflake = "";
export const logch: Snowflake = "";
export const aptguild: Snowflake = "";
export const developers: string[] = [];
export const admin: Snowflake[] = [];
export const enableWordle: string[] = [];
export const acRole: Snowflake = "";