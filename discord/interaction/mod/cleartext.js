module.exports = async (interaction) => {
    if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        return interaction.reply({ content: "/cleartext - Access Denied.", ephemeral: true });
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
