module.exports = async message => {
  if (message.author.userid !== config.owner) {
    return message.reply({ content: "Access denied.", ephemeral: true });
  }
  const fileName = message.content.split(" ")[1];
	if (!fileName?.length) return;
  if (fileName === "git") {
    const { exec } = require("child_process");
      exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
        if (error) {
          message.reply("!code error:\n" + error);
          return;
        }
        if (stdout === "Already up-to-date.") {
          return message.reply("``" + stdout + "``");
        }
        else
        message.reply(stderr + stdout);
      });
    return;
  }
  else {
    const run = require("./../hotpatch");
    run(fileName, message);
  }
};
