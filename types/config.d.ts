import type { GroupSymbol } from "../src/ps/client/index";
import type { Snowflake } from "discord.js";

export interface ModchatSetting {
    startTime: number;
    endTime: number;
    always: boolean;
    rank?: GroupSymbol;
    ignoreGlobals?: boolean;
    allowBusy?: boolean;
    allowAlts?: boolean;
    showRfaq?: boolean;
    disabled?: NodeJS.Timer | undefined;
}

type ActionType = "punish" | "hidetext" | "log";

export interface IRoomSettings {
    modchat?: ModchatSetting;
    stretchFilter?: ActionType;
    floodFilter?: boolean; // Mute or ignore
    useAPI?: ActionType;
    logChannel?: Snowflake;
}
