module.exports = (client, PSClient) => {
  global.time = require("@discordjs/builders").time;

  client.on("ready", async () => {
    const run = require("./ready");
    run(client);
  });
  
  client.on("messageCreate", message => {
    if (message.content.startsWith(">runjs")) {
      const run = require("./message/runjs");
      run(message);
    }
  });
  
  client.on("interactionCreate", interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "hotpatch") {
      const run = require("./interaction/hotpatch");
      run(interaction);
    }
    if (interaction.commandName === "ping") {
      const run = require("./interaction/ping");
      run(interaction);
    }
    
    if (interaction.commandName === "register") {
      const run = rewuire("./interaction/register");
      run(client, interaction, PSClient);
    }
    
    if (interaction.commandName === "apt") {
      const run = require("./interaction/points/apt");
      run(interaction);
    }
    
    if (interaction.commandName === "rpt") {
      const run = require("./interaction/points/rpt");
      run(interaction);
    }
    
    if (interaction.commandName === "clearleaderboard") {
      const run = require("./interaction/points/clearleaderboard");
      run(interaction);
    }

    if (interaction.commandName === "rank") {
      const run = require("./interaction/points/rank");
      run(interaction);
    }

    if (interaction.commandName === "cleartext") {
      const run = require("./interaction/mod/cleartext");
      run(interaction);
    }

    if (interaction.commandName === "forcecleartext") {
      const run = require("./interaction/mod/forcecleartext");
      run(interaction);
    }

    if (interaction.commandName === "mute") {
      const run = require("./interaction/mod/mute");
      run(interaction);
    }

    if (interaction.commandName === "unmute") {
      const run = require("./interaction/mod/unmute");
      run(interaction);
    }

    if (interaction.commandName === "kick") {
      const run = require("./interaction/mod/kick");
      run(interaction);
    }

    if (interaction.commandName === "ban") {
      const run = require("./interaction/mod/ban");
      run(interaction);
    }

    if (interaction.commandName === "forceban") {
      const run = require("./interaction/mod/forceban");
      run(client, interaction);
    }

    if (interaction.commandName === "unban") {
      const run = require("./interaction/mod/unban");
      run(client, interaction);
    }
    
  });
};
