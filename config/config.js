const {
    GatewayIntentBits: { Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans },
} = require("discord.js");

module.exports = {
    token: process.env.DISCORD, //leave blank to disable Discord
    options: {
        intents: [Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers, GuildPresences, GuildBans],
    },
    ops: {
        username: "Dirain1700~!",
        password: process.env.PS,
        avatar: "lillie-z",
        status: "Hi! I am a bot! :)",
        autoJoin: ["japanese", "botdev"],
    },
    testch: "886970564265259032",
    logch: "922453739225374720",
    // Please do not use this without permission from a room owner
    aptguild: "873211574876241931",
    owner: "dirain",
    admin: ["751433045529329825"], // Array of Discord IDs of administrators
    log: ["was banned", "was warned", "was muted", "was locked"],
    tourSettings: ["autostart 5", "autodq 3"],
    acRole: "888013264355749928",
};
