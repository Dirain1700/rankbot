"use strict";

import { exec, ExecException } from "child_process";
import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (message.author.userid !== config.owner || !message.isNotUnknown()) return void message.reply("Access denied.");
    const filePath = message.content.substring(10);
    if (!filePath) return;
    if (filePath === "git") {
        exec("git pull", (error: ExecException | null, stdout: string, stderr: string): void => {
            let result = "";
            if (error) result += error.toString() + "\n";
            if (stdout === "Already up-to-date.") {
                return void message.reply("``" + stdout + "``");
            } else {
                result += stdout;
                result += stderr;
            }
            if (result) message.reply("!code " + result);
        });
    } else if (filePath === "tsc") {
        exec("npm run build", (error: ExecException | null, stdout: string): void => {
            let result = "";
            if (error) {
                result += error.toString();
                result += stdout;
            } else result += "Compile sucessed.";
            message.reply((error ? "!code " : "") + result);
        });
    } else {
        if (!filePath || !fs.existsSync(filePath)) return;

        delete require.cache[`./${path.relative(__dirname, filePath)}`];
        message.reply(`Hotpatch successed: ${filePath}`);
    }
};
