/* eslint-disable @typescript-eslint/consistent-type-imports */

import type { BasePSCommandData, BaseDiscordCommandData } from "./commands";
import type { Species } from "./dex";
import type { Dict } from "./utils";
import type { DiscordCommandParser, DiscordCommandContext } from "../src/discord/parser";
import type { PSCommandParser, PSCommandContext } from "../src/showdown/parser";
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
    var DiscordCommands: Dict<BaseDiscordCommandData>;
    var DiscordCommandParser: DiscordCommandParser;
    var DiscordCommandContext: DiscordCommandContext["constructor"];
    var PSCommands: Dict<BasePSCommandData>;
    var PSCommandParser: PSCommandParser;
    var PSCommandContext: PSCommandContext["constructor"];
}

export {};
