module.exports = async (client, interaction) => {
  if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
    return interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
  }
  const targetID = interaction.options.getString("userid");
  const targetUser = await client.users.fetch(targetID);
  const reasons = interaction.options ?.getString("reason") ?? "none";
  await interaction.guild.bans.remove(targetUser, `by ${interaction.user.name}. reason: ${reasons}`);
  await interaction.reply({ content: `${time(new Date(), "T")} ${targetUser.tag} was unbanned from ${interaction.guild.name} by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
};
