module.exports = async message => {
  if (message.author.userid !== config.owner) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = message.content.split(" ")[1];
  if (fileName === "git") {
    const { exec } = require("child_process");
      exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
        if (error) {
          console.error("error: " + error);
          message.reply(error);
        }
        message.reply(stdout);
        return;
      });
    return;
  }
  const run = require("./../hotpatch");
  run(fileName, message);
};
