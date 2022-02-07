    
module.exports = interaction => {
  if (!interaction.user.id !== config.admin) {
    return interaction.reply({ content: "/clearleaderboard - Access denied.", ephemeral: true});
  }
  fs.writeFileSync("./rank.json", "{}");
  interaction.reply("Reset successed!");
};
