module.exports = (message) => {
  if (message.author.userid !== config.owner) return;
  const targetFilePath = message.content.substring(8).trim();
  try {
    const result = fs.readFileSync(targetFilePath);
	//eslint-disable-next-line no-empty
    message.reply("!code " + new String(result)).catch();
  } catch (e) {
    if (e.code === "ENOENT") message.reply("``MODULE_NOT_FOUND``");
  }
};