"use strict";

module.exports = async (interaction) => {
    const { MessageEmbed } = require("discord.js");
    const type = interaction.options.getString("type", true);
    const channel = interaction.options.getChannel("channel", true);

    const awaitMessageFilter = (m) => m.author === interaction.user;
    const content = await interaction.channel
        .awaitMessages({
            filter: awaitMessageFilter,
            max: 3,
            idle: 5 * 60 * 1000,
            errors: ["idle"],
        })
        .then((c) => c.map((m) => m.content));

    let message;
    switch (type) {
        case "string":
            message = { content: content.join("\n") };
            break;
        case "embeds": {
            const embeds = [];
            try {
                content.forEach((e) => embeds.push(JSON.parse(e)));
            } catch (e) {
                interaction.channel.send(e.toString());
            }
            try {
                message = { embeds: embeds.map((e) => new MessageEmbed(e)) };
            } catch (e) {
                interaction.channel.send(e.toString());
            }
            break;
        }
        case "string with embed": {
            const embeds = [];
            const objects = content.filter((e) => e.startsWith("embed: ")).map((e) => e.substring(7));
            const string = content.filter((e) => e.startsWith("string: ")).map((e) => e.substring(8));
            try {
                objects.forEach((e) => embeds.push(JSON.parse(e)));
            } catch (e) {
                interaction.channel.send(e.toString());
            }
            try {
                message = { content: string, embeds: embeds.map((e) => new MessageEmbed(e)) };
            } catch (e) {
                interaction.channel.send(e.toString());
            }
            break;
        }
    }
    if (!message) return void interaction.channel.send("Can't send empty message!");
    channel.send(message);
};
