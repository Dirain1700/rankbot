    
module.exports = interaction => {
  if (!interaction.user.id !== config.admin) {
    return interaction.reply({ content: "/clearleaderboard - Access denied.", ephemeral: true});
  }
  const file = path.resolve(__dirname, "./../../config/rank.json");
  fs.writeFileSync(file, "{}");
  interaction.reply("Reset successed!");
};
