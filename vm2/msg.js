const { MessageEmbed } = require('discord.js');


/**
 * @param {import('discord.js').StringResolvable|import('discord.js').APIMessage} content
 * @param {import('discord.js').MessageOptions|import('discord.js').MessageAdditions} options
 */

async function sendDeletable(OriginMsg, content, options){
  const replies = await OriginMsg.reply(content, options);
  const reply = Array.isArray(replies)
    ? replies[replies.length - 1]
    : replies;
  const wastebasket = '🗑️';
  const reactionFilter = (reaction, user) =>
    reaction.emoji.name === wastebasket && user.id === OriginMsg.author.id;
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
    OriginMsg.channel
      .awaitMessages(messageFilter, {
        max: 1,
        time: 60000,
        errors: ['time'],
      })
      .then(collection => collection.first());

  await reply.react(wastebasket);
  const run = async () => {
    const reaction = await awaitReaction().catch(() => null);
await console.log(reaction == null);
    if (!reaction) return reply.reactions.removeAll();

    const question = await OriginMsg.channel.send({
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
console.log(input);
    const option = parseInt(input.content.trim());
console.log(option);
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
        OriginMsg.delete(),
      ]);

    await Promise.all([
      reaction.users.remove(OriginMsg.author),
      question.delete(),
      input.delete(),
    ]);
    console.log("running...");
    return run();
  };
  console.log("completed!");
  run().catch(console.error);
}

exports.sendDeletable = ((OriginMsg, content, options) => sendDeletable(OriginMsg, content, options));
