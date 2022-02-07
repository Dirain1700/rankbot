module.exports = (client, ps) => {
  const tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j botdev");
  });
  
  ps.on("message", async message => {
    if (message.type !== "pm" || message.author.name === ps.status.username) return;
    if (message.content.startsWith("/invite")) {
      const run = require("./pm/invite");
      run(message);
    }else{
      const run = require("./commands");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat" || message.author.name === ps.status.username) return;
    if (message.target.roomid = "japanese") logmsg(message);
    if (message.content.startsWith("/log") && (message.target.roomid).includes("japanese")) {
      const run = require("./chat/sendlog");
      run(client, message);
    }
    if (message.cotent.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    else {
      const run = require("./commands")
      run(message);
    }
  });
};
