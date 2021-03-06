module.exports = (interaction) => {
    if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });
        return;
    }
    const score = interaction.options.getInteger("points");
    const targetUser = interaction.options.getUser("user");
    const file = path.resolve(__dirname, "./../../config/rank.json");
    const db = JSON.parse(fs.readFileSync(file));
    if (targetUser.id in db) {
        //ユーザーIDのデータがあるか判定
        // ポイント加算
        db[targetUser.id].points += score;
    } else {
        // ポイント設定
        db[targetUser.id] = { points: score };
    }
    // 書き換え
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
    //送信
    interaction.reply(`Added ${score}points to ${targetUser.tag} and having ${db[targetUser.id].points}points now.`);
    const sort = require("./../../ranksort");
    sort();
};
