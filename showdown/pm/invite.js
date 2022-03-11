module.exports = async (ps, message) => {
  if (message.author.userid !== "dirain" || message.author.group === " ") return;
  const targetRoom = message.content.substring(7);
  ps.send("|/j " + targetRoom);
  message.reply(`Joined room "${targetRoom}"`);
};
