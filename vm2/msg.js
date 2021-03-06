const { Message, MessageEmbed } = require("discord.js");

Message.prototype.sendDeletable = async function (content) {
    const reply = await this.reply(content);
    const wastebasket = "ποΈ";
    const reactionFilter = (reaction, user) => reaction.emoji.name === wastebasket && user.id === this.author.id;
    const messageFilter = (receiveMessage) => {
        const num = parseInt(receiveMessage.content.trim());
        if (Number.isNaN(num)) return false;
        if (num >= 0 && num <= 2) return true;
        else return false;
    };
    const awaitReaction = () =>
        reply
            .awaitReactions({
                filter: reactionFilter,
                max: 1,
                idle: 60000,
                errors: ["idle"],
            })
            .then((collection) => collection.first());

    const awaitOptionInput = () =>
        this.channel
            .awaitMessages({
                filter: messageFilter,
                max: 1,
                idle: 60000,
                errors: ["idle"],
            })
            .then((collection) => collection.first());

    const run = async () => {
        const reaction = await awaitReaction().catch(() => null);
        if (!reaction) return reply.reactions.removeAll();

        const question = await this.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("YELLOW")
                    .setTitle("ει€ζΉζ³γιΈζγγ¦γγ γγ(ζ°ε­)")
                    .setDescription(["0: γ­γ£γ³γ»γ«", "1: γͺγΆγ«γγ γγει€γγ", "2: γγͺγγιδΏ‘γγγ³γΌγγ¨γͺγΆγ«γγει€γγ"].join("\n")),
            ],
        });
        const input = await awaitOptionInput().catch(() => 0);
        console.log(input);
        const option = input === 0 ? 0 : parseInt(input.content.trim());
        if (option === 1) return Promise.all([reply.delete(), question.delete(), input.delete()]);
        if (option === 2) return Promise.all([reply.delete(), question.delete(), input.delete(), this.delete()]);

        await Promise.all([reaction.users.remove(this.author), question.delete(), input.delete()]);
        return run();
    };
    reply
        .react(wastebasket)
        .then(() => run())
        .catch(console.error);
};
