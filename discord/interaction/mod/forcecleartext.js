module.exports = async (client, interaction) => {
    if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        return interaction.reply({ content: "/forcecleartext - Access Denied.", ephemeral: true });
    }
    const targetID = await interaction.options.getString("userid");
    const targetCount = interaction.options?.getInteger("lines") ?? 1;
    const targetUser = await client.users.fetch(targetID);

    const messages = await interaction.channel.messages.fetch({ limit: 100 }).then((m) => m.filter((msg) => msg.author.id == targetID).first(targetCount));

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
            const deleteMessages = messages.map((m) => m.delete());
            Promise.all([deleteMessages])
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
