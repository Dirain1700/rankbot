import { GatewayIntentBits } from "discord.js";
import type { ClientOptions as DiscordClientOptions, Snowflake } from "discord.js";
import type { ClientOptions as PSClientOptions } from "@dirain/client";

const { Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans } = GatewayIntentBits;

export const DiscordOptions: DiscordClientOptions = {
    intents: [Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans],
};
export const PSOptions: PSClientOptions = {
    name: "Dirain1700~!",
    pass: process.env.PS!,
    avatar: "elaine",
    status: "Hi! I am a bot! :)",
    autoJoin: ["japanese"],
};
export const testCh: Snowflake = "1016979734988591104";
export const logch: Snowflake = "922453739225374720";
export const aptguild: Snowflake = "873211574876241931";
export const owner: string = "dirain";
export const admin: Snowflake[] = ["751433045529329825"];
export const log: string[] = ["was banned", "was warned", "was muted", "was locked"];
export const officials: string[] = ["japanese"];
export const wordle: string[] = ["japanese"];
export const tourSettings: string[] = ["autostart 5", "autodq 3"];
export const acRole: Snowflake = "888013264355749928";
