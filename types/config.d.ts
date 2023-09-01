import type { GroupSymbol } from "../src/ps/client/index";

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
