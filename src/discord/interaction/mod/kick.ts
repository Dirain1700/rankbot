"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers))
        return void interaction.reply({ content: "/kick - Access Denied.", ephemeral: true });

    const targetMember = interaction.options.getMember("user");
    if (
        !targetMember ||
        (interaction.guild.ownerId !== interaction.user.id &&
            targetMember.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0)
    )
        return void interaction.reply({ content: "Error: You cannot kick user higer role have.", ephemeral: true });

    const reasons = interaction.options.getString("reason", true);
    interaction.guild.members
        .kick(targetMember, `by ${interaction.user.tag}. reason: ${reasons}`)
        .then(() => {
            interaction.reply({
                content: `${time(new Date(), "T")} ${targetMember.user.tag} was kicked from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`,
                ephemeral: false,
            });
            targetMember.user.send(
                `${time(new Date(), "T")} You (${targetMember.user.tag}) were kicked from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`
            );
        })
        .catch((e) => interaction.reply(`Error: failed to kick ${targetMember.user.tag}.\nReason: ${e.toString()}`));
};
