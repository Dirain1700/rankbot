module.exports = async message => {
  if (message.author.userid !== config.owner) {
    return message.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = message.content.split(" ")[1];
  if (fileName === "git") {
    const { exec } = require("child_process");
      exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
        if (error) {
          message.reply("!code " + error);
        }
        if (stdout === "Already up-to-date.") {
          return message.reply("``" + stdout + "``");
        }
        if (stderr) {
          message.reply("!code " + stderr);
        }
        if (stdout) {
          message.reply("!code " + stdout);
        }
      });
    return;
  }
  const run = require("./../hotpatch");
  run(fileName, message);
};
