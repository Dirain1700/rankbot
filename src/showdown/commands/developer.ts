"use strict";

import { exec } from "child_process";

import type { BasePSCommandDefinitions } from "../../../types/commands";
import type { ExecException } from "child_process";

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
        run(argument, room, user): void {
            const targetFilePath = argument.trim();
            if (!fs.existsSync(targetFilePath)) return this.say("Module not found. Check spelling?");

            const result = fs.readFileSync(targetFilePath, "utf-8");
            this.sayCode(result);
        },
        syntax: ["[module]"],
        aliases: ["output"],
        developerOnly: true,
    },
    hotpatch: {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        run(argument, room, user): void {
            const filePath = argument.trim();
            if (!filePath) return;
            if (filePath === "git") {
                exec("git pull", (error: ExecException | null, stdout: string, stderr: string): void => {
                    let result = "";
                    if (error) result += error.toString() + "\n";
                    if (stdout === "Already up-to-date.") {
                        return this.sayCode(stdout);
                    } else {
                        result += stdout;
                        result += stderr;
                    }
                    if (result) this.sayCode(result);
                });
            } else if (filePath === "tsc") {
                this.say("Compiling...");
                exec("npm run build", (error: ExecException | null, stdout: string): void => {
                    if (error) {
                        this.sayCommand("!", "code", error.toString() + stdout);
                    } else this.say("Compile sucessed.");
                });
            } else {
                if (!filePath || !fs.existsSync(filePath)) return this.say("Error: The file does not exist.");

                const resolvedPath = Object.keys(require.cache).find((e) => e.includes(filePath.slice(1)));
                if (!resolvedPath) return void this.say("Error: The file does not exist");
                delete require.cache[resolvedPath];
                this.say(`Hotpatch successed: ${resolvedPath}`);
            }
        },
        syntax: ["[module]"],
        developerOnly: true,
    },
};
