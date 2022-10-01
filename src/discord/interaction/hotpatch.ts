"use strict";

import { inlineCode, codeBlock } from "discord.js";
import { exec, ExecException } from "child_process";
import type { ChatInputCommandInteraction } from "discord.js";

// filePath must be resolved path
export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    const filePath = interaction.options.getString("module", true);
    if (!filePath || !fs.existsSync(filePath)) return;

    if (filePath === "git") {
        interaction.deferReply({ ephemeral: false });
        exec("git pull", (error: ExecException | null, stdout: string, stderr: string): void => {
            let result = "";
            if (error) result += error.toString();
            if (stdout === "Already up-to-date.") {
                return void interaction.reply(inlineCode(stdout));
            } else {
                result += stdout;
                result += stderr;
            }
            if (result) interaction.followUp(codeBlock(result));
        });
        return;
    } else if (filePath === "tsc") {
        interaction.reply({ content: "Compiling...", ephemeral: false });
        exec("npm run build", (error: ExecException | null, stdout: string): void => {
            let result = "";
            if (error) {
                result += error.toString();
                result += stdout;
            } else result += "Compile sucessed.";
            interaction.editReply(error ? codeBlock(result) : inlineCode(result));
        });
        return;
    }
    const resolvedPath = Object.keys(require.cache).find((e) => e.includes(e));
    if (!resolvedPath) return void interaction.reply("Error: The file does not exist");
    interaction.followUp({ ephemeral: false });
    delete require.cache[resolvedPath];
    interaction.followUp(`Hotpatch successed: ${inlineCode(resolvedPath)}`);
};
