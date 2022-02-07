module.exports = async client => {
  client.on("interactionCreate", interaction => {
    if (interaction.commandName = "ping") {
      require("./interaction/ping")(client);
    }
  });
};
