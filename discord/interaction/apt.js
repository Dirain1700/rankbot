module.exports = interaction => {
  if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
    interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });
    return;
  }
  const how = interaction.options.getInteger("points");
  const target = interaction.options.getMember("user");
  const db = JSON.parse(fs.readFileSync("./rank.json"));
  if (target.user.id in db) { //ユーザーIDのデータがあるか判定
    // ポイント加算
    db[target.user.id].points += how;
  } else {
    // ポイント設定
    db[target.user.id] = { points: how };
  }
  // 書き換え
  fs.writeFileSync("./rank.json", JSON.stringify(db, null, 2));
  //送信
  interaction.reply(`Added ${how}points to ${target.user.tag} and having ${db[target.user.id].points}points now.`);
  //eslint-disabble-next-line
  ranksort();
}
