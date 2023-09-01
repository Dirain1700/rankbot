"use strict";

import { exec } from "child_process";

import { reloadModule } from "../../setup";

import type { BasePSCommandDefinitions } from "../../../types/commands";
import type { SingleModulePaths, DirectoryModulePaths } from "../../setup";

import type { ExecException } from "child_process";

const loadableModules = ["games", "commands", "client", "handler", "config", "dex"] as const;

export const commands: BasePSCommandDefinitions = {
    eval: {
        run(target, room, user) {
            // eslint-disable-line @typescript-eslint/no-unused-vars
            if (!Config.developers.includes(user.id)) return;
            try {
                let result = eval(target) as unknown;
                if (result === null) {
                    result = "null";
                } else if (result === undefined) {
                    result = "undefined";
                } else if (typeof result === "string" && !result) {
                    // prettier-ignore
                    result = "\"\"";
                } else if (typeof result === "number" && !result) {
                    result = "0";
                } else if (typeof result === "boolean" && !result) {
                    result = "false";
                }
                this.say(Tools.toString(result));
            } catch (e) {
                this.say((e as Error).message);
                console.log((e as Error).stack);
            }
        },
        aliases: ["js"],
        developerOnly: true,
    },
    export: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(target, room, user): void {
            const targetFilePath = target.trim();
            if (!fs.existsSync(targetFilePath)) return this.say("Module not found. Check spelling?");

            const result = fs.readFileSync(targetFilePath, "utf-8");
            this.sayCode(result);
        },
        syntax: ["[module]"],
        aliases: ["output"],
        developerOnly: true,
    },
    gitpull: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(target, room, user): void {
            exec("git pull", (error: ExecException | null, stdout: string, stderr: string): void => {
                let result = "";
                if (error) result += (error.stack ?? error.message) + "\n";
                if (stdout === "Already up-to-date.") {
                    return this.sayCode(stdout);
                } else {
                    result += stdout;
                    result += stderr;
                }
                if (result) this.sayCode(result);
            });
        },
        syntax: [""],
        developerOnly: true,
    },
    hotpatch: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(target, room, user) {
            const modules: Array<keyof typeof SingleModulePaths | keyof typeof DirectoryModulePaths> = [];

            const possibleModule: (typeof loadableModules)[number] = target as (typeof loadableModules)[number];
            switch (possibleModule) {
                case "client": {
                    modules.push(...(["room", "user", "clientuser"] as typeof modules));
                    break;
                }
                case "commands": {
                    modules.push(...(["psparser", "pscommands"] as typeof modules));
                    break;
                }
                case "config": {
                    modules.push(...(["config", "room"] as typeof modules));
                    break;
                }
                case "dex": {
                    modules.push(...(["dex", "dexdata"] as typeof modules));
                    break;
                }
                case "games": {
                    modules.push(...(["activity", "psgame", "pscommands", "tournament", "wordle"] as typeof modules));
                    break;
                }
                case "handler": {
                    modules.push(...(["pshandler"] as typeof modules));
                    break;
                }
                default:
                    return this.say("Module " + (possibleModule satisfies never) + " not found");
            }
            reloadModule(["build"]);
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
            (require("../../../../build.js") as typeof import("../../../build")).build();
            reloadModule(modules);

            this.say("Successfully hotpatched.");
        },
        aliases: ["reload"],
        syntax: ["[module]"],
        developerOnly: true,
        disabled: true,
    },
};
