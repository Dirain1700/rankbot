    
module.exports = interaction => {
  if (!interaction.user.id !== config.admin) {
    return interaction.reply({ content: "/clearleaderboard - Access denied.", ephemeral: true});
  }
  fs.writeFileSync("../../config/rank.json", "{}");
  interaction.reply("Reset successed!");
};
