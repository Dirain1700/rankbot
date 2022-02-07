module.exports = async interaction => {
  if (!interaction.memberPermissions.has("TIMEOUT_MEMBERS")) {
    return interaction.reply({ content: "/mute - Access denied.", ephemeral: true });
  }
  const target = interaction.options.getMember("user");
  if (target.user.id == interaction.user.id && target.user.id == interaction.guild.ownerId) {
    return interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });
  }
  const hour = interaction.options.getInteger("hours");
  const min = interaction.options.getInteger("minutes");
  const reasons = interaction.options.getString("reason");
  
  await target.timeout(hour * 60 * 60 * 1000 + min * 60 * 1000, `by ${interaction.user.tag}. reason: ${reasons}`);
  let log;
  if (hour === 0) {
    log = `${time(new Date(), "T")} ${target.user.tag} was muted for ${min}minutes by ${interaction.user.tag}. (${reasons})`;
  } else {
    log = `${time(new Date(), "T")} ${target.user.tag} was muted for ${hour} and ${min}minutes by ${interaction.user.tag}. (${reasons})`
  }
  interaction.reply({ content: log, ephemeral: false });
}
