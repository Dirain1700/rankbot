"use strict";

import { time } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (Config.admin.includes(interaction.user.id))
        return void interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });

    const targetID = interaction.options.getString("userid", true);
    const targetUser = await discord.users.fetch(targetID);
    const reasons = interaction.options.getString("reason", true);

    interaction.guild.bans
        .create(targetUser, { reason: `by ${interaction.user.tag}. Force-BAN. reason: ${reasons}` })
        .then(() => {
            interaction.reply({
                content: `${time(new Date(), "T")} ${targetUser.tag} was force-banned from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`,
                ephemeral: false,
            });
            targetUser.send(
                `${time(new Date(), "T")} You (${targetUser.tag}) were banned from ${interaction.guild.name} by ${
                    interaction.user.tag
                }.(${reasons})`
            );
        })
        .catch((e) => interaction.reply(`Error: failed to ban ${targetUser.tag}.\nReason: ${e.toString()}`));
};
