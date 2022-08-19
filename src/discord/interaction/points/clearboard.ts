"use strict";

import { PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator))
        return void interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });

    const file = path.resolve(__dirname, "./../../config/rank.json");
    fs.writeFileSync(file, "{}");
    interaction.reply("Reset successed!");
};
