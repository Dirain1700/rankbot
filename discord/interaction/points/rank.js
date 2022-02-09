module.exports = interaction => {  
  const sort = require("./../../ranksort");
  sort();
  //JSONを読み込む
  const file = path.resolve(__dirname, "./../../config/rank.json");
  const db = JSON.parse(fs.readFileSync(file));
  const targetUser = interaction.options?.getUser("user") ?? interaction.user;
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
