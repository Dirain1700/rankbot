"use strict";

import { codeBlock, inlineCode } from "discord.js";

import type { BaseDiscordCommandDefinitions } from "../../../../types/commands";
import type { ExecException } from "node:child_process";

export const commands: BaseDiscordCommandDefinitions = {
    hotpatch: {
        run(): void {
            const filePath = this.interaction.options.getString("module", true);
            if (!filePath || !fs.existsSync(filePath)) return;

            if (filePath === "git") {
                void this.interaction.deferReply({ ephemeral: true });
                Tools.exec("git pull", {}, (error: ExecException | null, stdout: string, stderr: string): void => {
                    let result = "";
                    if (error) result += error.stack ?? error.message;
                    if (stdout === "Already up-to-date.") {
                        return void this.interaction.reply(inlineCode(stdout));
                    } else {
                        result += stdout;
                        result += stderr;
                    }
                    if (result) void this.interaction.followUp(codeBlock(result));
                });
                return;
            }
            try {
                Tools.execSync("npm run esbuild");
            } catch (e) {
                return void this.interaction.followUp({
                    content: codeBlock((e as ExecException).stack ?? (e as ExecException).message),
                    ephemeral: true,
                });
            }
            const resolvedPath = Object.keys(require.cache).find((e) => e.includes(e));
            if (!resolvedPath) return void this.interaction.reply("Error: The file does not exist");
            void this.interaction.deferReply({ ephemeral: false });
            delete require.cache[resolvedPath];
            void this.interaction.followUp(`Hotpatch successed: ${inlineCode(resolvedPath)}`);
        },
        developerOnly: true,
        resolvable: {
            name: "hotpatch",
            description: "Hotpatch modules",
            options: [
                {
                    type: 3,
                    name: "module",
                    description: "A name of the module",
                    required: true,
                },
            ],
        },
    },
};
