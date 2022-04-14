module.exports = (message) => {
    if (message.author.userid !== config.owner || message.author.group === " ") return;
    const targetRoom = message.content.substring(7);
    message.reply("/j " + targetRoom);
    message.reply(`Joined room "${targetRoom}"`);
};
