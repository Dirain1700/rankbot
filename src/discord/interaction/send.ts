"use strict";

import { EmbedBuilder, PermissionsBitField } from "discord.js";

import type { ChatInputCommandInteraction, GuildTextBasedChannel, Message, Snowflake, Collection, APIEmbed } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">): Promise<void> => {
    if (!interaction.channel || !interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
        return void interaction.reply({ content: "/send - Access denied.", ephemeral: true });

    const type = interaction.options.getString("type", true);
    const channel = interaction.options.getChannel("channel", true);

    if ([2, 4, 12, 13, 14, 15].includes(channel.type))
        return void interaction.reply("Cannot send messages to Voice channels and Private Threads!");

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    interaction.reply(`Please send ${type} in 2 minutes!`).catch((e) => {
        throw e;
    });

    const awaitMessageFilter = (m: Message) => m.author === interaction.user;
    const content: string[] | null = await interaction.channel
        .awaitMessages({
            filter: awaitMessageFilter,
            max: 5,
            idle: 3 * 60 * 1000,
            errors: ["idle"],
        })
        .then((c) => c.map((m) => m.content))
        .catch((c: Collection<Snowflake, Message> | undefined) => (c ? c.map((m: Message) => m.content) : null));

    if (!content) return void interaction.channel.send("Got empty message!");

    let message;
    switch (type) {
        case "string":
            message = { content: content.join("\n") };
            break;
        case "embeds": {
            const embeds: APIEmbed[] = [];
            try {
                content.forEach((e: string) => embeds.push(JSON.parse(e) as APIEmbed));
            } catch (e: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                interaction.channel.send((e as SyntaxError).toString());
            }
            try {
                message = { embeds: embeds.map((e) => new EmbedBuilder(e)) };
            } catch (e: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                interaction.channel.send((e as Error).toString());
            }
            break;
        }
        case "string with embed": {
            const embeds: APIEmbed[] = [];
            const objects: string[] = content.filter((e) => e.startsWith("{"));
            const string: string[] = content.filter((e) => !e.startsWith("{"));
            try {
                objects.forEach((e: string) => embeds.push(JSON.parse(e) as APIEmbed));
            } catch (e: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                interaction.channel.send((e as SyntaxError).toString());
            }
            try {
                message = { content: string.join("\n"), embeds: embeds.map((e) => new EmbedBuilder(e)) };
            } catch (e: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                interaction.channel.send((e as Error).toString());
            }
            break;
        }
    }
    if (!message?.content?.length && !message?.embeds?.length) return void interaction.channel.send("Can't send empty message!");

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (channel as GuildTextBasedChannel).send(message);
};
