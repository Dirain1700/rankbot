module.exports = async (client, interaction) => {
  if (interaction.user.id != config.admin) {
    return interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
  }
  const targetID = interaction.options.getString("userid");
  const targetUser = await client.users.fetch(targetID);
  const day = interaction.options.getInteger("days");
  const reasons = interaction.options.getString("reason");
  
  await interaction.guild.bans.create(targetUser, { days: day, reason: `by ${interaction.user.tag}. Force-BAN. reason: ${reasons}` });
  await interaction.reply({ content: `${time(new Date(), "T")} ${targetUser.tag} was force-banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
  await targetUser.send(`${time(new Date(), "T")} You (${targetUser.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
  
  const targetCount = interaction.options?.getInteger("lines");
  if (targetCount) return;
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const collector = await messages.filter(msg => msg.author.id == targetID);
  const msg = collector.first(targetCount);
  interaction.channel.bulkDelete(msg);
};
