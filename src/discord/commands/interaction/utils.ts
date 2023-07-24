"use strict";

import { EmbedBuilder, PermissionsBitField } from "discord.js";

import type { BaseDiscordCommandDefinitions } from "../../../../types/commands";
import type { APIEmbed, Collection, GuildTextBasedChannel, Message, Snowflake } from "discord.js";

export const commands: BaseDiscordCommandDefinitions = {
    ping: {
        async run(): Promise<void> {
            const now = Date.now();
            const msg = ["pong!", "", `gateway: ${this.interaction.client.ws.ping}ms`];
            await this.interaction.reply({ content: msg.join("\n"), ephemeral: true });
            void this.interaction.editReply([...msg, `往復: ${Date.now() - now}ms`].join("\n"));
        },
        resolvable: {
            name: "ping",
            description: "Measure ping",
        },
    },
    send: {
        async run(): Promise<void> {
            if (
                !this.interaction.guild ||
                !this.interaction.inCachedGuild() ||
                !this.interaction.channel ||
                !this.interaction.channel.isTextBased() ||
                this.interaction.channel.isDMBased()
            ) {
                return void this.interaction.reply({
                    content: "The channel was not found; Please report this to depeloper.",
                    ephemeral: true,
                });
            }
            if (!this.interaction.memberPermissions.has(PermissionsBitField.Flags.ModerateMembers))
                return void this.sayError("PERMISSION_DENIED", {});

            const type = this.interaction.options.getString("type", true);
            const channel = this.interaction.options.getChannel("channel", true);

            if ([2, 4, 12, 13, 14, 15].includes(channel.type))
                return void this.interaction.reply("Cannot send messages to Voice channels and Private Threads!");

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.interaction.reply(`Please send ${type} in 2 minutes!`).catch((e) => {
                throw e;
            });

            const awaitMessageFilter = (m: Message) => m.author === this.interaction.user;
            const content: string[] | null = await this.interaction.channel
                .awaitMessages({
                    filter: awaitMessageFilter,
                    max: 5,
                    idle: 3 * 60 * 1000,
                    errors: ["idle"],
                })
                .then((c) => c.map((m) => m.content))
                .catch((c: Collection<Snowflake, Message> | undefined) => (c ? c.map((m: Message) => m.content) : null));

            if (!content) return void this.interaction.channel.send("Got empty message!");

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
                        void this.interaction.channel.send((e as SyntaxError).toString());
                    }
                    try {
                        message = { embeds: embeds.map((e) => new EmbedBuilder(e)) };
                    } catch (e: unknown) {
                        void this.interaction.channel.send((e as Error).toString());
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
                        void this.interaction.channel.send((e as SyntaxError).toString());
                    }
                    try {
                        message = { content: string.join("\n"), embeds: embeds.map((e) => new EmbedBuilder(e)) };
                    } catch (e: unknown) {
                        void this.interaction.channel.send((e as Error).toString());
                    }
                    break;
                }
            }
            if (!message?.content?.length && !message?.embeds?.length)
                return void this.interaction.channel.send("Can't send empty message!");

            void (channel as GuildTextBasedChannel).send(message);
        },
        guildOnly: true,
        resolvable: {
            name: "send",
            description: "Send a message via a bot.",
            options: [
                {
                    type: 7,
                    name: "channel",
                    description: "A channel to send content",
                    required: true,
                },
                {
                    type: 3,
                    name: "type",
                    description: "A type of content to send",
                    required: true,
                    choices: [
                        {
                            name: "string",
                            value: "string",
                        },
                        {
                            name: "embeds",
                            value: "embeds",
                        },
                        {
                            name: "string with content",
                            value: "string with content",
                        },
                    ],
                },
            ],
        },
    },
};
