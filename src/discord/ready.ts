"use strict";

export default () => {
    if (!discord.isReady()) return;
    console.log(`Logged in as ${discord.user.tag}`);
    discord.user.setPresence({ activities: [{ name: "NEO SKY, NEO MAP!", type: 2 }], status: "online" });
};
