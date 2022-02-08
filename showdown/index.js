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
    }
    else if (message.author.userid === config.owner) {
      const run = require("./commands");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat" || message.author.name === ps.status.username) return;
    if (message.target.roomid === "japanese") logmsg(message);
    if (message.content.startsWith("/log") && (message.target.roomid).includes("japanese")) {
      const run = require("./chat/sendlog");
      run(client, message);
    }
    if (message.content.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    else if (message.author.userid === config.owner) {
      const run = require("./commands")
      run(message);
    }
  });

  function logmsg(message) {
      const msgtime = Math.floor(message.time / 1000);
      const add = {
        "time": msgtime,
        "user": message.author.userid,
        "content": message.content
      };
      const json = JSON.parse(fs.readFileSync("./config/log/chatlog.json"));
      json.push(add);
      json.sort((a, b) => b.time - a.time);
      fs.writeFileSync("./../config/log/chatlog.json", JSON.stringify(json, null, 2));
  }
};
