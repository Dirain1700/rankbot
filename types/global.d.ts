import type { Snowflake } from "discord.js";

declare global {
    var fs: typeof import("fs");
    var path: typeof import("path");
    var config: typeof import("../config/config");
    var discord: typeof import("../src/index").DiscordClient;
    var PS: typeof import("../src/index").PSClient;
    var Tools: typeof import("@dirain/client").Tools;
    var pendingVerification: Map<string, Snowflake>;
}

export {};
