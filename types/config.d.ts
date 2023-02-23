import type { GroupSymbol } from "@dirain/client";

export interface ModchatSetting {
    startTime: number;
    endTime: number;
    always?: boolean;
    rank?: boolean;
    ignoreGlobals: boolean;
    allowBusy: boolean;
}
