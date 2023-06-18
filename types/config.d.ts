import type { GroupSymbol } from "@dirain/client";

export interface ModchatSetting {
    startTime: number;
    endTime: number;
    always: boolean;
    rank?: GroupSymbol;
    ignoreGlobals?: boolean;
    allowBusy?: boolean;
    allowAlts?: boolean;
    showRfaq?: boolean;
}
