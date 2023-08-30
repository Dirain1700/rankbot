"use strict";

import type { BaseInteraction } from "discord.js";

Discord.on("ready", () => {
    // isReady() doesn't work right now. wtf!
    if (!Discord.isReady() || !Discord.user) return;
    console.log(`Logged in as ${Discord.user.tag}`);
    Config.onConnectDiscord.call(Discord.user);
    Discord.user.setPresence({ activities: [{ name: "SINGING, DREAMING, NOW!", type: 2 }], status: "online" });
});

Discord.on("interactionCreate", (interaction: BaseInteraction): void => {
    if (!Discord.isReady()) return;
    if (!interaction.isChatInputCommand()) return;
    DiscordCommandParser.parse(interaction);
});
