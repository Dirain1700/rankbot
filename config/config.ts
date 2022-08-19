import { GatewayIntentBits } from "discord.js";
import type { ClientOptions as DiscordClientOptions, Snowflake } from "discord.js";
import type { ClientOptions as PSClientOptions } from "@dirain/client";

const { Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans } = GatewayIntentBits;

export const config = {
    DiscordOptions: {
        intents: [Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans],
    } as DiscordClientOptions,
    PSOptions: {
        username: "Dirain1700~!",
        password: process.env.PS,
        avatar: "elaine",
        status: "Hi! I am a bot! :)",
        autoJoin: ["japanese", "botdev"],
    } as PSClientOptions,
    testch: "886970564265259032" as Snowflake,
    logch: "922453739225374720" as Snowflake,
    // Please do not use this without permission from a room owner
    aptguild: "873211574876241931" as Snowflake,
    owner: "dirain" as string,
    admin: ["751433045529329825"] as Snowflake[], // Array of Discord IDs of administrators
    log: ["was banned", "was warned", "was muted", "was locked"] as string[],
    tourSettings: ["autostart 5", "autodq 3"] as string[],
    acRole: "888013264355749928" as Snowflake,
};
