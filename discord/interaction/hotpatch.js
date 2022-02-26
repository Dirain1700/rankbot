module.exports = async interaction => {
  if (interaction.user.id !== config.admin[0]) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = interaction.options.getString("module");
  if (fileName === "git") {
    interaction.deferReply();
    const { codeBlock, inlineCode } = require("@discordjs/builders");
    const { exec } = require("child_process");
      exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
        if (error) {
          interaction.followUp(inlineCode(error));
          return;
        }
        if (stdout === "Already up-to-date.") {
          return interaction.followUp(inlineCode(stdout));
        }
        else 
          interaction.followUp(codeBlock("diff", stderr + stdout));
      });
    return;
  }
  const run = require("./../hotpatch");
  run(fileName, interaction);
};
