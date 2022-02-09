module.exports = interaction => {
  if (interaction.user.id !== config.admin[1]) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }
  interaction.deferReply({ ephemeral: true });
  const fileName = interaction.options.getString("module");
  const run = require("./../hotpatch");
  run(fileName, interaction);
};