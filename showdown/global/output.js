module.exports = (message) => {
  if (message.author.userid !== config.owner) return;
  const targetFilePath = message.content.substring(8).trim();
  try {
    const result = fs.readFileSync(targetFilePath);
    message.reply("!code " + new String(result));
  } catch (e) {
    if (e.code === "ENOENT") message.reply("``MODULE_NOT_FOUND``");
  }
};