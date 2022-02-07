module.exports = (client, ps) => {
  const tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j botdev");
  });
  
  ps.on("message", async message => {
    if (message.type !== "pm" || message.author.name === ps.status.username) return;
    if (message.content.startsWith("/invite") {
      const run = require("./pm/invite");
      run(message);
    }
  });
};
