module.exports = interaction => {  
  require("./../../ranksort");
  ranksort();
  //JSONを読み込む
  const db = JSON.parse(fs.readFileSync("./../../config/rank.json"));
  let targetUser = interaction.options?.getUser("user");
  if (!targetUser) targetUser = interaction.user.id;
  // userIDのあるデータ
  const data = db[targetUser.id];
  if (!data) {
   return interaction.reply({ content: `${targetUser.tag} has 0points now.`, ephemeral: true });
  }
  // そのデータの順位
  // とりあえず1とする
  let rank = 1;
  for (const id in db) {
    // 自分より得点が高い人がいたら、順位を下げる
    if (data.points < db[id].points) {
      rank += 1;
    }
  }
  interaction.reply({ content: `${targetUser.tag} has ${data.points}points now and ${rank}th.`, ephemeral: true });
};
