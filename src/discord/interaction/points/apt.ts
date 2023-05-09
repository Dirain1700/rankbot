"use strict";

import { PermissionsBitField } from "discord.js";

import sort from "../../ranksort";

import type { PointsDB } from "../../ranksort";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator))
        return void interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });

    const score = interaction.options.getInteger("points", true);
    const targetUser = interaction.options.getUser("user", true);
    const file = path.resolve(__dirname, "./../../config/rank.json");
    const db: PointsDB = JSON.parse(fs.readFileSync(file, "utf-8")) as PointsDB;
    if (targetUser.id in db) {
        (db[targetUser.id] as { points: number }).points += score;
    } else {
        db[targetUser.id] = { points: score };
    }
    fs.writeFileSync(file, JSON.stringify(db, null, 4));
    void interaction.reply(
        `Added ${score}points to ${targetUser.tag} and having ${(db[targetUser.id] ?? { points: 0 }).points}points now.`
    );
    sort();
};
