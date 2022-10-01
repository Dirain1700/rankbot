"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers))
        return void interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });

    const targetID = interaction.options.getString("userid", true);
    const targetUser = await discord.users.fetch(targetID);
    const reasons = interaction.options?.getString("reason") ?? "none";
    await interaction.guild.bans.remove(targetUser, `by ${interaction.user.tag}. reason: ${reasons}`);
    await interaction.reply({
        content: `${time(new Date(), "T")} ${targetUser.tag} was unbanned from ${interaction.guild.name} by ${
            interaction.user.tag
        }.(${reasons})`,
        ephemeral: false,
    });
};
