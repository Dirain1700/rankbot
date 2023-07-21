"use strict";

export default () => {
    // isReady() doesn't work right now. wtf!
    if (!discord.isReady() || !discord.user) return;
    console.log(`Logged in as ${discord.user.tag}`);

    Config.onConnectDiscord.call(discord.user);
    discord.user.setPresence({ activities: [{ name: "SINGING, DREAMING, NOW!", type: 2 }], status: "online" });
};
