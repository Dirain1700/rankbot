module.exports = async interaction => {
  if (interaction.user.id !== config.admin[0]) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = interaction.options.getString("module");
  if (fileName === "git") {
    const { exec } = require("child_process");
      exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
        if (error) {
          console.error("error: " + error);
          interaction.reply(error);
        }
        interaction.reply(stdout);
        return;
      });
    return;
  }
  const run = require("./../hotpatch");
  run(fileName, interaction);
};