"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
        return void interaction.reply({ content: "/unmute - Access denied.", ephemeral: true });

    const targetMember = interaction.options.getMember("user");
    const reasons = interaction.options.getString("reason") ?? "none";

    if (!targetMember) return void interaction.reply("Error: failed to unban specified user.");

    targetMember
        .timeout(null, `by ${interaction.user.tag}. reason: ${reasons}`)
        .then(() => {
            interaction.reply({
                content: `${time(new Date(), "T")} ${targetMember.user.tag} was unmuted by ${interaction.user.tag}.(${reasons})`,
                ephemeral: false,
            });
        })
        .catch((e) => interaction.reply(`Error: failed to unban ${targetMember.user.tag}.\nReason: ${e.toString()}`));
};
