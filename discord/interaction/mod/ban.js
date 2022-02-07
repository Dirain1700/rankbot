module.exports = interaction => {
  if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
    return interaction.reply({ content: "/ban - Access Denied.", ephemeral: true });
  }
  const targetMember = interaction.options.getMember("user");
  if (interaction.guild.ownerId !== interaction.user.id && targetMember.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
    return interaction.reply({ content: "Error: You cannot BAN user higer role have.", ephemeral: true });
  }
  const targetCount = interaction.options?.getInteger("lines");
  if (targetCount) {
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const collector = await messages.filter(msg => msg.author.id == targetMember.user.id);
    const msg = collector.first(targetCount);
    interaction.channel.bulkDelete(msg);
  }
  const day = interaction.options.getInteger("days");
  const reasons = interaction.options.getString("reason");
  await interaction.guild.bans.create(targetMember, { days: day, reason: `by ${interaction.user.tag}. reason: ${reasons}` });
  await interaction.reply({ content: `${time(new Date(), "T")} ${targetMember.user.tag} was banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
  await targetMember.user.send(`${time(new Date(), "T")} You (${targetMember.user.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
  const targetCount = interaction.options?.getInteger("lines");
  if (!targetCount) return;
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const collector = await messages.filter(msg => msg.author.id == targetMember.user.id);
  const msg = collector.first(targetCount);
  interaction.channel.bulkDelete(msg);
};
