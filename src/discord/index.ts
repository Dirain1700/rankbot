"use strict";

import type { BaseInteraction } from "discord.js";

const onReady = () => {
    // isReady() doesn't work right now. wtf!
    if (!BotClient.disc.isReady() || !BotClient.disc.user) return;
    console.log(`Logged in as ${BotClient.disc.user.tag}`);
    Config.onConnectDiscord.call(BotClient.disc.user);
    BotClient.disc.user.setPresence({ activities: [{ name: "素顔のピクセル", type: 2 }], status: "online" });
};

const onInteractionCreate = (interaction: BaseInteraction): void => {
    if (!BotClient.disc.isReady()) return;
    if (!interaction.isChatInputCommand()) return;
    DiscordCommandParser.parse(interaction);
};

export function setEventListeners() {
    BotClient.disc.on("ready", onReady);
    BotClient.disc.on("interactionCreate", onInteractionCreate);
}
