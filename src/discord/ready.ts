"use strict";

export default () => {
    // isReady() doesn't work right now. wtf!
    if (!discord.isReady() || !discord.user) return;
    console.log(`Logged in as ${discord.user.tag}`);
    discord.user.setPresence({ activities: [{ name: "NEO SKY, NEO MAP!", type: 2 }], status: "online" });
};
