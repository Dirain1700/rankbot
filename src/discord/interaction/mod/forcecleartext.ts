"use strict";

import { time, PermissionsBitField } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (!interaction.channel || !interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages))
        return void interaction.reply({ content: "/forcecleartext - Access Denied.", ephemeral: true });

    const targetID = interaction.options.getString("userid", true);
    const targetCount = interaction.options?.getInteger("lines") ?? 1;
    const targetUser = await discord.users.fetch(targetID);

    const messages = await interaction.channel.messages
        .fetch({ limit: 100 })
        .then((m) => m.filter((msg) => msg.author.id == targetID).first(targetCount));

    const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${interaction.channel.name} by ${
        interaction.user.tag
    }.`;

    interaction.channel
        .bulkDelete(messages)
        .then(() =>
            interaction.reply({
                content: log,
                ephemeral: false,
            })
        )
        .catch(() => {
            Promise.all(messages.map((m) => m.delete()))
                .then(() => {
                    interaction.reply({
                        content: log,
                        ephemeral: false,
                    });
                })
                .catch(() => {
                    interaction.reply({
                        content: "Error: Couldn't delete messages.",
                        ephemeral: true,
                    });
                });
        });
};
