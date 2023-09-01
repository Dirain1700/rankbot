"use strict";

import type { BaseInteraction } from "discord.js";

const onReady = () => {
    // isReady() doesn't work right now. wtf!
    if (!Discord.isReady() || !Discord.user) return;
    console.log(`Logged in as ${Discord.user.tag}`);
    Config.onConnectDiscord.call(Discord.user);
    Discord.user.setPresence({ activities: [{ name: "SINGING, DREAMING, NOW!", type: 2 }], status: "online" });
};

const onInteractionCreate = (interaction: BaseInteraction): void => {
    if (!Discord.isReady()) return;
    if (!interaction.isChatInputCommand()) return;
    DiscordCommandParser.parse(interaction);
};

export function setEventListeners() {
    Discord.on("ready", onReady);
    Discord.on("interactionCreate", onInteractionCreate);
}
