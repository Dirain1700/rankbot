import type { Collection, Snowflake } from "discord.js";
import type { Wordle } from "../src/showdown/wordle/main";
import type { Species } from "./dex";
import type { BaseCommandDefinitions } from "./commands";
import type { CommandParser } from "../src/showdown/parser";
import type { Dict } from "./utils";

declare global {
    var fs: typeof import("fs");
    var path: typeof import("path");
    var Config: typeof import("../config/config");
    var discord: typeof import("../src/index").DiscordClient;
    var PS: typeof import("../src/index").PSClient;
    var Tools: typeof import("../src/Tools").Tools;
    var pendingVerification: Map<string, Snowflake>;
    var Wordles: Dict<Wordle>;
    var Dex: Collection<string, Species>;
    var Commands: BaseCommandDefinitions;
    var PSCommandParser: CommandParser;
}

export {};
