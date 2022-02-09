module.exports = interaction => {
  if (interaction.user.id !== config.admin[1]) return;
  const fileName = interaction.options.getString("module");
  const run = require("./../hotpatch");
  run(fileName, interaction);
};