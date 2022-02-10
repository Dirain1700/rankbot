module.exports = async interaction => {
  if (interaction.user.id !== config.admin[0]) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = interaction.options.getString("module");
  if (fileName === "git") {
    const { execSync } = require("child_process");
    try {
      const result = execSync("git pull", { stdio: 'inherit' }).toString("utf-8");
      execSync("git pull", { stdio: 'inherit' });
      await interaction.reply(result);
      return;
    }catch{
      const result = execSync("git pull", { stdio: 'inherit' }).toString("utf-8");
      interaction.reply(result);
      return;
    }
  }
  const run = require("./../hotpatch");
  run(fileName, interaction);
};