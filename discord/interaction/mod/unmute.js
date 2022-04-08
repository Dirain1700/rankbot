module.exports = (interaction) => {
    if (interaction.memberPermissions.has("TIMEOUT_MEMBERS")) {
        return interaction.reply({ content: "/unmute - Access denied.", ephemeral: true });
    }
    const targetMember = interaction.options.getMember("user");
    const reasons = interaction.options?.getString("reason") ?? "none";

    targetMember.timeout(null, `by ${interaction.user.tag}. reason: ${reasons}`);
    interaction.reply({ content: `${time(new Date(), "T")} ${targetMember.user.tag} was unmuted by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
};
