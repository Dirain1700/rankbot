"use strict";

import { time, PermissionsBitField } from "discord.js";

import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
        return void interaction.reply({ content: "/mute - Access denied.", ephemeral: true });

    const targetMember = interaction.options.getMember("user");
    if (!targetMember || (targetMember.user.id == interaction.user.id && targetMember.user.id == interaction.guild.ownerId))
        return void interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });

    const hour = interaction.options.getInteger("hours", true);
    const min = interaction.options.getInteger("minutes", true);
    const reasons = interaction.options.getString("reason", true);

    targetMember
        .timeout(hour * 60 * 60 * 1000 + min * 60 * 1000, `by ${interaction.user.tag}. reason: ${reasons}`)
        .then(() => {
            let log;
            if (hour === 0) {
                log = `${time(new Date(), "T")} ${targetMember.user.tag} was muted for ${min}minutes by ${
                    interaction.user.tag
                }. (${reasons})`;
            } else {
                log = `${time(new Date(), "T")} ${targetMember.user.tag} was muted for ${hour} and ${min}minutes by ${
                    interaction.user.tag
                }. (${reasons})`;
            }
            void interaction.reply({ content: log, ephemeral: false });
        })
        .catch((e) => void interaction.reply(`Error: failed to mute ${targetMember.user.tag}.\nReason: ${(e as Error).toString()}`));
};
