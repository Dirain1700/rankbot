module.exports = interaction => {
  if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
    return interaction.reply({ content: "/rpt - Access Denied.", ephemeral: true });
  }
  const score = interaction.options.getInteger("points");
  const targetUser = interaction.options.getUser("user");
  const db = JSON.parse(fs.readFileSync("../../config/rank.json"));
  if (targetUser.id in db) { //ユーザーIDのデータがあるか判定
    // ポイント加算
    db[targetUser.id].points -= score;
  } else {
    return interaction.reply({ content: `Error: ${targetUser.tag} has no ranks.`, ephemeral: true });
  }
  // 書き換え
  fs.writeFileSync("../../config/rank.json", JSON.stringify(db, null, 2));
  //送信
  interaction.reply(`Removed ${score}points from ${targetUser.tag} and having ${db[targetUser.id].points}points now.`);
  const { ranksort } = require("../ranksort");
  ranksort();
};
