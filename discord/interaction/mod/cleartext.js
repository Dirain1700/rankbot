module.exports = async interaction => {
  if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
    return interaction.reply({ content: "/cleartext - Access Denied.", ephemeral: true });
  }
  
  const targetCount = interaction.options?.getInteger("lines") ?? 1;
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const targetUser = await interaction.options.getUser("user");
  const collector = await messages.filter(msg => msg.author.id === targetUser.id);
  const msg = collector.first(targetCount);
  
  await interaction.channel.bulkDelete(msg);
  
  const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`;
  
  await interaction.reply({ content: log, ephemeral: false });
};
