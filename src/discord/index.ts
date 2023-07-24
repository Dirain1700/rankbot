"use strict";

import ready from "./ready";

import type { BaseInteraction } from "discord.js";

export default () => {
    discord.on("ready", ready);

    discord.on("interactionCreate", (interaction: BaseInteraction): void => {
        if (!discord.isReady()) return;
        if (!interaction.isChatInputCommand()) return;
        DiscordCommandParser.parse(interaction);
    });
};
