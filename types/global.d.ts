/* eslint-disable @typescript-eslint/consistent-type-imports */

import type { BaseCommandDefinitions } from "./commands";
import type { Species } from "./dex";
import type { Dict } from "./utils";
import type { CommandParser, CommandContext } from "../src/showdown/parser";
import type { Wordle } from "../src/showdown/wordle/main";
import type { Collection } from "discord.js";

declare global {
    var fs: typeof import("node:fs");
    var path: typeof import("node:path");
    var Config: typeof import("../config/config");
    var discord: typeof import("../src/index").DiscordClient;
    var PS: typeof import("../src/index").PSClient;
    var Tools: typeof import("../src/Tools").Tools;
    var Wordles: Dict<Wordle>;
    var Dex: Collection<string, Species>;
    var Commands: BaseCommandDefinitions;
    var PSCommandParser: CommandParser;
    var CommandContext: CommandContext["constructor"];
}

export {};
