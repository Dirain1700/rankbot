"use strict";

import { PermissionsBitField } from "discord.js";
import sort from "../../ranksort";
import type { ChatInputCommandInteraction } from "discord.js";
import type { PointsDB } from "../../ranksort";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator))
        return void interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });

    const score = interaction.options.getInteger("points", true);
    const targetUser = interaction.options.getUser("user", true);
    const file = path.resolve(__dirname, "./../../config/rank.json");
    const db: PointsDB = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (db[targetUser.id]) {
        //ユーザーIDのデータがあるか判定
        // ポイント加算
        (db[targetUser.id] as { points: number }).points -= score;
    } else {
        return void interaction.reply({ content: `Error: ${targetUser.tag} has no ranks.`, ephemeral: true });
    }
    // 書き換え
    fs.writeFileSync(file, JSON.stringify(db, null, 4));
    //送信
    interaction.reply(`Removed ${score}points from ${targetUser.tag} and having ${(db[targetUser.id] ?? { points: 0 }).points}points now.`);
    sort();
};