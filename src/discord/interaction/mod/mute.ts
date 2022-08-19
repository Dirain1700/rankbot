"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
        return void interaction.reply({ content: "/mute - Access denied.", ephemeral: true });

    const target = interaction.options.getMember("user");
    if (!target || (target.user.id == interaction.user.id && target.user.id == interaction.guild.ownerId))
        return void interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });

    const hour = interaction.options.getInteger("hours", true);
    const min = interaction.options.getInteger("minutes", true);
    const reasons = interaction.options.getString("reason", true);

    await target.timeout(hour * 60 * 60 * 1000 + min * 60 * 1000, `by ${interaction.user.tag}. reason: ${reasons}`);
    let log;
    if (hour === 0) {
        log = `${time(new Date(), "T")} ${target.user.tag} was muted for ${min}minutes by ${interaction.user.tag}. (${reasons})`;
    } else {
        log = `${time(new Date(), "T")} ${target.user.tag} was muted for ${hour} and ${min}minutes by ${
            interaction.user.tag
        }. (${reasons})`;
    }
    interaction.reply({ content: log, ephemeral: false });
};
