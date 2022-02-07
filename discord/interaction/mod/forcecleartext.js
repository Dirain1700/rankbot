module.exports = async interaction => {
  if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
    return interaction.reply({ content: "/forcecleartext - Access Denied.", ephemeral: true });
  }
  const targetID = await interaction.options.getString("userid");
  const targetCount = interaction.options?.getInteger("lines") ?? 1;
  const time = Math.floor(Date.now() / 1000);
  const targetUser = await client.users.fetch(targetID);
  
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const collector = await messages.filter(msg => msg.author.id == targetID);
  const msg = collector.first(targetCount);
  interaction.channel.bulkDelete(msg);
  
  const { time } = require("@discordjs/builders");
  const log = `${time(new Date(), "T")} ${targetCount} of ${targetUser.tag}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`;
  interaction.reply({ content: log, ephemeral: false });
    }
