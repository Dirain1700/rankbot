module.exports = async (client, interaction, PSClient) => {
    const UserRegex = /\d{17,19}/g;
    const userid = interaction.options
        .getString("userid", true)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    if (!userid) return void interaction.reply({ content: `${interaction.options.getString("userid", true)} is an invalid userid.`, ephemeral: true });
    if ([...PSClient.pending.values()].includes(interaction.user.id))
        return void interaction.reply({ content: "You are already in pending list!", ephemeral: true });
    PSClient.pending.set(userid, interaction.user.id);
    interaction.reply({
        content: `Waiting for you to send the ?register command in Pokémon Showdown. PM to Dirain1700 with the content \`?register ${interaction.user.id}\` in 10 minutes!`,
        fetchReply: true,
        ephemeral: false,
        allowedMentions: {
            repliedUser: true,
        },
    });
    //prettier-ignore
    return new Promise((resolve, reject) => {
            PSClient.on("message", function (message) {
                if (message.isIntro || message.type !== "pm" || message.author.id !== userid || !message.content.startsWith("?register ")) return;
                const inputUserid = message.content.substring(10).trim().replace(/\D/g, "");
                if (!UserRegex.test(inputUserid) || !client.users.cache.has(inputUserid))
                    return void message.reply("Error: The id of Discord that you input was invalid.");
                if (interaction.user.id !== this.pending.get(message.author.userid))
                    return void message.reply(
                        `Error: The id of Discord that you input was not found in registering list. Type "/register ${message.author.userid}" in Discord.`
                    );
                if (!message.author.autoconfirmed)
                    return void message.reply("Your account is not autoconfirmed account. Try after you got autoconfirmed!\n!faq ac");
                interaction.member.roles.add(interaction.guild.roles.cache.get(config.acRole));
                message.reply("Registration sucessed!");
                interaction.member.setNickname(message.author.name, `Register UserName: ${message.author.username}`);
                resolve();
            });
            setTimeout(reject, 10 * 60 * 1000);
        })
            //eslint-disable-next-line no-empty
            .then(() => interaction.editReply(`Sucessfully registerd your account as "${userid}" and added <@&${config.acRole}> role.`).catch())
            //eslint-disable-next-line no-empty
            .catch(() => interaction.editReply("Failed to Registration: Timed out!").catch())
            .finally(() => PSClient.pending.delete(userid));
};
