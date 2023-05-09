"use strict";

import { time, PermissionsBitField } from "discord.js";

import type { ChatInputCommandInteraction } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (!interaction.channel || !interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return void interaction.reply({ content: "/cleartext - Access Denied.", ephemeral: true });
    }

    const targetCount = interaction.options.getInteger("lines") ?? 1;
    const messages = await interaction.channel.messages
        .fetch({ limit: 100 })
        .then((m) => m.filter((msg) => msg.author.id === targetUser.id).first(targetCount));
    const targetUser = interaction.options.getUser("user", true);

    const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${interaction.channel.name} by ${
        interaction.user.tag
    }.`;

    interaction.channel
        .bulkDelete(messages)
        .then(
            () =>
                void interaction.reply({
                    content: log,
                    ephemeral: false,
                })
        )
        .catch(() => {
            const deleteMessages = messages.map((m) => m.delete());
            Promise.all([deleteMessages])
                .then(() => {
                    void interaction.reply({
                        content: log,
                        ephemeral: false,
                    });
                })
                .catch(() => {
                    void interaction.reply({
                        content: "Error: Couldn't delete messages.",
                        ephemeral: true,
                    });
                });
        });
};
