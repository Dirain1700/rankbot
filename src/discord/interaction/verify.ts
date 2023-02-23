"use strict";

import type { Message } from "@dirain/client";
import type { ChatInputCommandInteraction, Role } from "discord.js";

export default async (interaction: ChatInputCommandInteraction<"cached">) => {
    const UserRegex = /\d{17,19}/g;
    const userid = interaction.options
        .getString("userid", true)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    if (!userid)
        return void interaction.reply({
            content: `${interaction.options.getString("userid", true)} is an invalid userid.`,
            ephemeral: true,
        });
    if ([...pendingVerification.values()].includes(interaction.user.id))
        return void interaction.reply({ content: "You are already in pending list!", ephemeral: true });

    pendingVerification.set(userid, interaction.user.id);

    interaction.reply({
        content: `Waiting for you to send the ?verify command in Pokémon Showdown. PM to Dirain1700 with the content \`?register ${interaction.user.id}\` in 10 minutes!`,
        fetchReply: true,
        ephemeral: false,
        allowedMentions: {
            repliedUser: true,
        },
    });

    function onMessage(message: Message, resolve: (value: void) => void, reject: (value: void) => void): void {
        if (!message.inPm()) return;
        if (message.author.id !== userid || !message.content.startsWith("?register ")) return;
        const inputUserid = message.content.substring(10).trim().replace(/\D/g, "");
        if (!UserRegex.test(inputUserid) || !discord.users.cache.has(inputUserid))
            return void message.reply("Error: The id of Discord that you input was invalid.");
        if (interaction.user.id !== pendingVerification.get(message.author.userid))
            return void message.reply(
                `Error: The id of Discord that you input was not found in registering list. Type "/register ${message.author.userid}" in Discord.`
            );
        if (!message.author.autoconfirmed)
            return void message.reply("Your account is not autoconfirmed account. Try after you got autoconfirmed!\n!faq ac");
        interaction.member.roles.add(interaction.guild.roles.cache.get(Config.acRole) as Role);
        message.reply("Verifycation sucessed!");
        interaction.member.setNickname(message.author.name, `Register UserName: ${message.author.name}`);
        resolve();
        setTimeout(reject, 10 * 60 * 1000);
    }

    //prettier-ignore
    return new Promise((resolve, reject) => {
            PS.on("messageCreate", (message: Message) => onMessage(message, resolve, reject));
        })
            .then(() => interaction.editReply(`Sucessfully verified your account as "${userid}" and added <@&${Config.acRole}> role.`).catch())
            //eslint-disable-next-line no-empty
            .catch(() => interaction.editReply("Failed to Registration: Timed out!").catch())
            .finally(() => {
                pendingVerification.delete(userid);
                PS.removeListener("messageCreate", onMessage);
            });
};
