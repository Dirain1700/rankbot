"use strict";

import axios from "axios";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { JSDOM } from "jsdom";

import type { BaseDiscordCommandDefinitions } from "../../../../types/commands";
import type { AxiosResponse, AxiosError } from "axios";
import type { APIEmbedField } from "discord-api-types/v10";
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
    reagent: {
        run() {
            if (!Discord.isReady() || !this.interaction.channel) return;

            const name = this.interaction.options.getString("name", true);
            if (!name) this.interaction.reply("Error: No arguments provided.").catch(console.error);
            this.interaction.deferReply().catch(console.error);

            const url = (reg: string) => "https://labchem-wako.fujifilm.com/jp/product/result/product.html?fw=" + reg;
            const domain = "https://labchem-wako.fujifilm.com";
            axios(url(name))
                .then((res: AxiosResponse): void => {
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    const dom = new JSDOM(res.data as string);
                    const isNoResult = dom.window.document.querySelectorAll("div.no-result").length > 0;
                    if (isNoResult) return void this.interaction.followUp("No reagents found.");
                    const LINK_REG = /\/jp\/product\/detail\/[A-Z0-9-]{6,}\.html/gmu;
                    let Descs = [...dom.window.document.querySelectorAll("div.product-name").values()].filter(
                        (e) => !e.querySelector(":scope > span.st")
                    );
                    if (Descs.length > 10) Descs.length = 10;
                    Descs = Descs.slice(0, ~~(Descs.length / 2));
                    let Details = [...dom.window.document.querySelectorAll("div.product-list-in:not(div.st-discon)").values()];
                    if (Details.length > 10) Details.length = 10;
                    Details = Details.slice(0, ~~(Details.length / 2));
                    const links = Descs.map((elem) => (elem.innerHTML.match(LINK_REG) ?? [])[0] ?? "")
                        .map((e) => e.replaceAll("\t", "").replaceAll("\n", "").trim())
                        .map((e) => (e ? domain + e : null));
                    const manufactures = Descs.map((elim) =>
                        (elim.querySelector("dl.manufacturer")!.querySelector("dd")?.innerHTML ?? "")
                            .replaceAll("\t", "")
                            .replaceAll("\n", "")
                            .trim()
                    );
                    const Grades = Descs.map((elim) =>
                        ((elim.querySelector("p.grade")?.querySelector("b") ?? {})?.innerHTML ?? "")
                            .replaceAll("\t", "")
                            .replaceAll("\n", "")
                            .trim()
                    );
                    const Names = Descs.map((elim) =>
                        elim.querySelector("em.name")!.innerHTML.replaceAll("\t", "").replaceAll("\n", "").split("<")[0]!.trim()
                    );
                    const codes = Details.map((elim) =>
                        [...elim.querySelectorAll("div.lb-code")!.values()].map((e) =>
                            (e.querySelector("dd")?.innerHTML ?? "").replaceAll("\t", "").replaceAll("\n", "").trim()
                        )
                    );
                    const CAS = Details.map((elim) =>
                        (
                            [...elim.querySelector("div.product-set1")!.querySelectorAll("dl")!.values()]
                                .find((e) => (e.querySelector("dt")?.innerHTML ?? "").startsWith("CAS"))
                                ?.querySelector("dd")?.innerHTML ?? ""
                        )
                            .replaceAll("\t", "")
                            .replaceAll("\n", "")
                            .trim()
                    );
                    const sizes = Details.map((elim) =>
                        [...elim.querySelectorAll("td.product-size")!.values()].map((e) =>
                            (e.querySelector("div.product-tbl-in")?.innerHTML ?? "").replaceAll("\t", "").replaceAll("\n", "").trim()
                        )
                    );
                    const prices = Details.map((elim) =>
                        [...elim.querySelectorAll("td.product-price")!.values()].map((e) =>
                            (e.querySelector("div.product-tbl-in")!.querySelector("dd")?.innerHTML ?? "")
                                .replaceAll("\t", "")
                                .replaceAll("\n", "")
                                .trim()
                        )
                    ).map((e) => (e ? e : null));
                    const fields: APIEmbedField[] = [];
                    for (let i = 0; i < Descs.length; i++) {
                        const obj: APIEmbedField = { name: Names[i]!, value: "" };
                        let value = "";
                        for (let n = 0; n < codes[i]!.length; n++) {
                            if (value) value += "\n";
                            let str = "";
                            str += codes[i]![n];
                            str = str.padEnd(12);
                            str += sizes[i]![n];
                            str = str.padEnd(20);
                            str += prices[i]![n] || "Not for sell";
                            value += str;
                        }
                        const desc = [];
                        desc.push("Manufacture: " + manufactures[i]);
                        if (Grades[i]) desc.push("Grade: " + Grades[i]);
                        if (CAS[i]) desc.push("CAS RN: " + CAS[i]);
                        if (links[i]) desc.push(`[Original link](${links[i]})`);
                        if (desc.length) value = desc.join("\n") + "\n" + value;
                        obj.value = value;
                        fields.push(obj);
                    }
                    const Embed = new EmbedBuilder()
                        .setTitle("Reagents available from Wako")
                        .setURL(url(name))
                        .setFooter({
                            text: `Note: These are current as of ${new Date().toLocaleString("ja-jp", {
                                timeZone: "Asia/Tokyo",
                            })} and are subject to change by Wako.`,
                        })
                        .addFields(fields);

                    this.interaction
                        .followUp({ embeds: [Embed], fetchReply: true })
                        .catch((e) => this.interaction.followUp((e as Error).stack as string).catch(console.error));
                })
                .catch((e: AxiosError) => this.interaction.followUp(Tools.toString(e)).catch(console.error));
        },
        resolvable: {
            name: "reagent",
            description: "Get reagents from Wako's data base.",
            options: [
                {
                    type: 3,
                    name: "name",
                    description: "Reagent's name",
                    required: true,
                },
            ],
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
                        void this.interaction.channel.send((e as SyntaxError).stack ?? (e as SyntaxError).message);
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
                        void this.interaction.channel.send((e as SyntaxError).stack ?? (e as SyntaxError).message);
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
