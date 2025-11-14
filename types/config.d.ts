import type { ModchatLevel } from "../src/ps/client/types/index";
import type { Snowflake } from "discord.js";

export interface ModchatSetting {
    startTime: number;
    endTime: number;
    always: boolean;
    baseRank: ModchatLevel;
    elevatedRank?: ModchatLevel;
    ignoreGlobals?: boolean;
    allowBusy?: boolean;
    allowAlts?: boolean;
    announce?: string[];
    autoReset?: boolean;
    disabled?: NodeJS.Timeout | null;
    timeout?: NodeJS.Timeout | null;
}

type ActionType = "punish" | "hidetext" | "log";

export interface IRoomSettings {
    modchat?: ModchatSetting;
    stretchFilter?: ActionType;
    floodFilter?: boolean; // Mute or ignore
    useAPI?: ActionType;
    logChannel?: Snowflake;
    scheduledTours?: boolean;
}
