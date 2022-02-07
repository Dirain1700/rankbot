module.exports = async client => {
  global.time = require("@discordjs/builders").time;
  client.on("interactionCreate", interaction => {
    if (interaction.commandName === "ping") {
      const run = require("./interaction/ping")
      run(interaction);
    }
  });
};
