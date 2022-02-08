    
module.exports = interaction => {
  if (!interaction.user.id !== config.admin) {
    return interaction.reply({ content: "/clearleaderboard - Access denied.", ephemeral: true});
  }
  fs.writeFileSync(__dirname, "./../../config/rank.json", "{}");
  interaction.reply("Reset successed!");
};
