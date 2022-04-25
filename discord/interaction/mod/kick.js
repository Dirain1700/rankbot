module.exports = async (client, interaction) => {
    if (!interaction.memberPermissions.has("KICK_MEMBERS")) {
        return interaction.reply({ content: "/kick - Access Denied.", ephemeral: true });
    }
    const targetMember = interaction.options.getMember("user");
    if (interaction.guild.ownerId !== interaction.user.id && targetMember.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
        return interaction.reply({ content: "Error: You cannot kick user higer role have.", ephemeral: true });
    }
    const reasons = interaction.options.getString("reason");
    interaction.guild.members.kick(targetMember, { reason: `by ${interaction.user.tag}. reason: ${reasons}` });
    interaction.reply({
        content: `${time(new Date(), "T")} ${targetMember.user.tag} was kicked from ${interaction.guild.name} by ${interaction.user.tag}.(${reasons})`,
        ephemeral: false,
    });
    targetMember.user.send(
        `${time(new Date(), "T")} You (${targetMember.user.tag}) were kicked from ${interaction.guild.name} by ${interaction.user.tag}.(${reasons})`
    );
};
