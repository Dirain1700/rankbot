module.exports = async client => {
  client.on("interactionCreate", interaction => {
    if (interaction.commandName = "ping") {
      const run = require("./interaction/ping")
      run(interaction);
    }
  });
};
