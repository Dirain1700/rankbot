"use strict";

import { Message, EmbedBuilder } from "discord.js";
import type { MessageReaction, User, MessageReplyOptions } from "discord.js";

export {};

declare module "discord.js" {
    interface Message {
        sendDeletable: (content: string | MessageReplyOptions) => Promise<void>;
    }
}

Message.prototype.sendDeletable = async function (content: string | MessageReplyOptions) {
    const reply = await this.reply(content);
    const wastebasket = "🗑️";
    const reactionFilter = (reaction: MessageReaction, user: User) => reaction.emoji.name === wastebasket && user.id === this.author.id;
    const messageFilter = (receiveMessage: Message) => {
        if (receiveMessage.author.id !== this.author.id) return false;
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

    const run = async (): Promise<void> => {
        const reaction = await awaitReaction().catch(() => null);
        if (!reaction) return void reply.reactions.removeAll();

        const question = await this.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("削除方法を選択してください(数字)")
                    .setDescription(
                        ["0: キャンセル", "1: リザルトだけを削除する", "2: あなたが送信したコードとリザルトを削除する"].join("\n")
                    ),
            ],
        });
        const input = await awaitOptionInput().catch(() => 0);
        if (!input || typeof input === "number") return void Promise.all([reaction.users.remove(this.author), question.delete()]);
        const option = parseInt(input.content.trim());
        if (option === 1) return void Promise.all([reply.delete(), question.delete(), input.delete()]);
        if (option === 2) return void Promise.all([reply.delete(), question.delete(), input.delete(), this.delete()]);

        await Promise.all([reaction.users.remove(this.author), question.delete(), input.delete()]);
        return run();
    };
    reply
        .react(wastebasket)
        .then(() => run())
        .catch(console.error);
};
