/* eslint-disable @typescript-eslint/consistent-type-imports */

import type { BasePSCommandData, DiscordCommandSingleData } from "./commands";
import type { Species } from "./dex";
import type { Dict } from "./utils";
import type { DiscordCommandParser, DiscordCommandContext } from "../src/discord/parser";
import type { Client, Rooms, Users, TournamentManager } from "../src/ps/client/src";
import type { Dex } from "../src/ps/dex";
import type { PSCommandParser, PSCommandContext } from "../src/ps/parser";
import type { Database } from "../src/ps/storage";
import type { Wordle } from "../src/ps/wordle/main";
import type { Client as DiscordClient } from "discord.js";

declare global {
    var fs: typeof import("node:fs");
    var path: typeof import("node:path");
    var Config: typeof import("../config/config");
    var BotClient: {
        ps: Client;
        disc: DiscordClient;
    };
    var Rooms: Rooms;
    var Users: Users;
    var Database: Database;
    var Tools: typeof import("../src/Tools").Tools;
    var TournamentManager: TournamentManager;
    var Wordles: Dict<Wordle>;
    var Dex: Dex<string, Species>;
    var DiscordCommands: Record<Snowflake, DiscordCommandSingleData>;
    var DiscordCommandParser: DiscordCommandParser;
    var DiscordCommandContext: DiscordCommandContext["constructor"];
    var PSCommands: Dict<BasePSCommandData>;
    var PSCommandParser: PSCommandParser;
    var PSCommandContext: PSCommandContext["constructor"];
}

export {};
