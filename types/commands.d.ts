import type { Room, User } from "@dirain/client";

import type { CommandContext } from "../src/showdown/parser";
import type { Dict, arrayOf } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CommandDefinitions<T, returns = any> {
    run: (this: T, argument: string, room: Room | User, user: User, command: string, timestamp: number) => returns;
    original?: string | true;
    pmOnly?: boolean;
    chatOnly?: boolean;
    pmSyntax?: string[];
    syntax?: string[];
    developerOnly?: boolean;
    aliases?: string[];
}

export type BaseCommandData = CommandDefinitions<CommandContext, void>;

export type BaseCommandGuide = Omit<BaseCommandData, "run">;

export type BaseCommandDefinitions = Dict<CommandDefinitions<CommandContext, void>>;

export type BaseCommandGuides = Dict<Omit<CommandDefinitions<CommandContext, void>, "run">>;
