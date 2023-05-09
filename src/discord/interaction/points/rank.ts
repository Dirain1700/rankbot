"use strict";

import { PermissionsBitField } from "discord.js";

import sort from "../../ranksort";

import type { PointsDB } from "../../ranksort";
import type { ChatInputCommandInteraction } from "discord.js";

export default (interaction: ChatInputCommandInteraction<"cached">): void => {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator))
        return void interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });

    sort();
    //JSONを読み込む
    const file = path.resolve(__dirname, "./../../config/rank.json");
    const db: PointsDB = JSON.parse(fs.readFileSync(file, "utf-8")) as PointsDB;
    const targetUser = interaction.options?.getUser("user") ?? interaction.user;
    // userIDのあるデータ
    const data = db[targetUser.id];
    if (!data) return void interaction.reply({ content: `${targetUser.tag} has 0points now.`, ephemeral: true });

    // そのデータの順位
    // とりあえず1とする
    let rank = 1;
    for (const id in db) {
        // 自分より得点が高い人がいたら、順位を下げる
        if (data.points < (db[id] as { points: number }).points) {
            rank += 1;
        }
    }
    void interaction.reply({ content: `${targetUser.tag} has ${data.points}points now and ${rank}th.`, ephemeral: true });
};
