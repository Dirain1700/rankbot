"use strict";

export default async () => {
    if (!discord.isReady()) return;
    console.log(`Logged in as ${discord.user.tag}`);
    discord.user.setPresence({ activities: [{ name: "未来は風のように", type: 2 }], status: "online" });
};
