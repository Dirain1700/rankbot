module.exports = ps => {
  if (message.author.userid !== "dirain" || message.author.group !== " ") return;
  const targetRoom = message.content.replace("/invite ", "");
  ps.send("|/j " + targetRoom);
  await message.reply(`Joined room "${targetRoom}"`);
}
