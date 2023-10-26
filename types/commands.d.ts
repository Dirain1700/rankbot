import type { Dict } from "./utils";
import type { DiscordCommandContext } from "../src/discord/parser";
import type { Room } from "../src/ps/client/src/Room";
import type { User } from "../src/ps/client/src/User";
import type { PSCommandContext } from "../src/ps/parser";
import type { ApplicationCommandData, Snowflake } from "discord.js";

/**
 * PS Commands type definitions
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PSCommandDefinitions<T, returns = any> {
    run: (this: T) => returns;
    original?: string | true;
    pmOnly?: boolean;
    chatOnly?: boolean;
    pmSyntax?: string[];
    syntax?: string[];
    developerOnly?: boolean;
    aliases?: string[];
    disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PSCommandRunTimeDefinitions<T, K = any> extends PSCommandDefinitions<T, K> {
    originalName: string;
}

export type BasePSCommandData = PSCommandRunTimeDefinitions<PSCommandContext, void>;

export type BasePSCommandGuide = Omit<BasePSCommandData, "run">;

export type BasePSCommandDefinitions = Dict<PSCommandDefinitions<PSCommandContext, void>>;

export type PSCommandErrorInputType = "INVALID_ROOM" | "INVALID_BOT_ROOM" | "MISSING_BOT_RANK" | "PERMISSION_DENIED" | "WORDLE_DISABLED";

/**
 * Discord Command type definitions
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DiscordCommandDefinitions<T, returns = any> {
    run: (this: T) => returns;
    dmOnly?: boolean;
    guildOnly?: boolean;
    dmSyntax?: string[];
    syntax?: string[];
    developerOnly?: boolean;
    aliases?: string[];
    disabled?: boolean;
    resolvable: ApplicationCommandData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DiscordCommandRunTimeDefinitions<T, K = any> extends DiscordCommandDefinitions<T, K> {
    name: string;
    guildId?: Snowflake;
}

export type DiscordCommandSingleData = DiscordCommandRunTimeDefinitions<DiscordCommandContext>;

export type DiscordCommandSingleGuide = Omit<DiscordCommandSingleData, "run">;

export type DiscordCommandSingleDefiniton = DiscordCommandDefinitions<DiscordCommandContext>;

export type BaseDiscordCommandDefinitions = Dict<DiscordCommandSingleDefiniton>;

export type BaseDiscordGuildCommandDefinitions = Record<Snowflake, BaseDiscordCommandDefinitions>;

export type BaseDiscordRunTimeCommandDefinitions = Dict<DiscordCommandSingleData>;

export type BaseDiscordRunTimeGuildCommandDefinitions = Record<Snowflake, BaseDiscordRunTimeCommandDefinitions>;

export type DiscordCommandErrorInputType = "INVALID_GUILD" | "INVALID_CHANNEL" | "MISSING_PERMISSION" | "PERMISSION_DENIED";
