import { GatewayIntentBits } from "discord.js";

import type { ClientOptions as PSClientOptions, Tournament, Message, User } from "../src/ps/client/src";
import type { ClientOptions as DiscordClientOptions, ClientUser as DiscordClientUser, Snowflake } from "discord.js";

import type { IRoomSettings } from "../types/config";
import type { Dict } from "../types/utils";
import type { IWordleConfig } from "../types/wordle";

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

export const roomAliases: Dict<string> = {};

export const commandPrefix = "";
export const readme = "";
export const roomSettings: Dict<IRoomSettings> = {};
export const developers: string[] = [];
export const admin: Snowflake[] = [];
export const enableWordle: Dict<IWordleConfig> = {};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function onConnectDiscord(this: DiscordClientUser): void {}

export const onUserJoin: Dict<{ run: (this: User) => void; cooldown: number; lastTime: number }> = {};
export const onRoomMessage: Dict<(this: Message) => void> = {};
export const onTournamentCreate: Dict<(this: Tournament) => void> = {};
