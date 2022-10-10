"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.inCachedGuild() || !interaction.channel || !interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)) {
        return void interaction.reply({ content: "/ban - Access Denied.", ephemeral: true });
    }
    const targetMember = interaction.options.getMember("user");
    if (
        !targetMember ||
        (interaction.guild.ownerId !== interaction.user.id &&
            targetMember.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0)
    ) {
        return void interaction.reply({ content: "Error: You cannot BAN user higer role have.", ephemeral: true });
    }

    const reasons = interaction.options.getString("reason");
    interaction.guild.bans
        .create(targetMember, { reason: `by ${interaction.user.tag}. reason: ${reasons}` })
        .then(() => {
            interaction.reply({
                content: `${time(new Date(), "T")} ${targetMember.user.tag} was banned from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`,
                ephemeral: false,
            });
            targetMember.user.send(
                `${time(new Date(), "T")} You (${targetMember.user.tag}) were banned from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`
            );
        })
        .catch((e) => interaction.reply(`Error: failed to ban ${targetMember.user.tag}.\nReason: ${e.toString()}`));
};
