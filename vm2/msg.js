const { Message, MessageEmbed } = require('discord.js');

Message.prototype.sendDeletable = async function(content){
  const replies = await this.reply(content);
  console.log(replies.size);
  //Expected output: Number
  //but got undefiend
  const reply = Array.isArray(replies)
    ? replies[replies.size - 1]
    : replies;
  const wastebasket = '🗑️';
  const reactionFilter = (reaction, user) =>
    reaction.emoji.name === wastebasket && user.id === this.author.id;
  const messageFilter = receiveMessage => {
    const num = parseInt(receiveMessage.content.trim());
    if (Number.isNaN(num)) return false;
    if (num >= 0 && num <= 2) return true;
    else return false;
  };
  const awaitReaction = () =>
    reply
      .awaitReactions(reactionFilter, {
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .then(collection => collection.first());

  const awaitOptionInput = () =>
    this.channel
      .awaitMessages(messageFilter, {
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .then(collection => collection.first());

  await reply.react(wastebasket);
  const run = async () => {
    const reaction = await awaitReaction().catch(() => null);
    //test
    await console.log(reaction == null);
    if (!reaction) return reply.reactions.removeAll();

    const question = await this.channel.send({
      embeds:
      [
        new MessageEmbed()
          .setColor('YELLOW')
          .setTitle('削除方法を選択してください（数字）')
          .setDescription(
            [
              '0: キャンセル',
              '1: リザルトだけを削除する',
              '2: あなたが送信したコードとリザルトを削除する',
            ].join('\n')
          )
      ]
    });
    const input = await awaitOptionInput().catch(() => 0);
    const option = parseInt(input.content.trim());
    if (option === 1)
      return Promise.all([
        Array.isArray(replies)
          ? replies.map(message => message.delete())
          : reply.delete(),
        question.delete(),
        input.delete(),
      ]);
    if (option === 2)
      return Promise.all([
        Array.isArray(replies)
          ? replies.map(message => message.delete())
          : reply.delete(),
        question.delete(),
        input.delete(),
        this.delete(),
      ]);

    await Promise.all([
      reaction.users.remove(this.author),
      question.delete(),
      input.delete(),
    ]);
    return run();
  };
  run()
    .then(console.log)
    .catch(console.error);
};

module.exports = Message;
