module.exports = async (client, interaction, PSClient) => {
    const { MessageMentions: { USERS_PATTERN: UserRegex } } = require("discord.js");
    const userid = interaction.options.getString("userid", true).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!userid) return void interaction.reply({ content: `${interaction.options.getString("userid", true)} is an invalid userid.`, ephemeral: true });
    PSClient.pending.set(userid, interaction.user.id);
    interaction.reply({ content: `Waiting for you to send the ?register command in Pokémon Showdown. PM to Dirain1700 with the content "?register ${interaction.user.id}" in 10 minutes!`, fetchReply: true, ephmeral: true });
    return void new Promise((resolve, reject) => {
        // eslint-disable-next-line no-unused-vars
        PSClient.on("message", function (message) {
            if (this.isIntro || this.author.id !== userid || !this.content.startsWith("?register ")) return;
            const inputUserid = this.content.substring(10);
            if (!UserRegex.test(inputUserid) || !client.users.cache.get(inputUserid)) return void this.reply("Error: The id of Discord that you input was invalid.");
            if (userid !== this.parent.pending.get(this.author.userid)) return void this.reply("Error: The id of Discord that you input was not found in registering list. Type \"/register [userid]\" in Discord.");
            if (!this.author.autoconfirmed) return void this.reply("Your account is not autoconfirmed annount. Try after you got autoconfirmed!\n!faq ac");
            interaction.member.roles.add(interaction.roles.cache.get(config.acRole));
            interaction.fetchReply()
                .then(m => m.edit(`Sucessfully registerd your account as "${this.username}" and added <&${config.acRole}> role.`))
                .catch(console.error);
            resolve();
            return;
        });
        setTimeout(() => {
            interaction.fetchReply()
                .then(m => m.edit("Failed to Registration: Timeout!"))
                .catch(console.error);
            reject();
        }, 10 * 60 * 1000);
    });
};
