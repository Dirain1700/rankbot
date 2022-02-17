module.exports = (client, ps) => {
  require("./structures");
  global.tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j botdev");
  });
  
  ps.on("message", message => {
    if (message.isIntro || message.author.name === ps.status.username) return;
    if (message.content === ".resetlog") {
      const run = require("./global/resetlog");
      run(message);
    }
    if (message.content.startsWith(".hotpatch")) {
      const run = require("./global/hotpatch");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "pm" || message.author.name === ps.status.username) return;
    if (message.content.startsWith("/invite")) {
      const run = require("./pm/invite");
      run(ps, message);
    }
    if (message.content.starsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat") return;
    if (message.target.roomid.includes("japanese")) logmsg(message);
    if (message.content.startsWith("/log") && (message.target.roomid).includes("japanese")) {
      const run = require("./chat/sendlog");
      run(client, ps, message);
    }
    if (message.content.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    if (message.content.startsWith(".ct")) {
      if (message.getRoomAuth() === " ") return;
      const run = require("./tour/tourmanager");
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
      const file = path.resolve(__dirname, "./../config/log/chatlog.json");
      const json = JSON.parse(fs.readFileSync(file));
      json.push(add);
      json.sort((a, b) => b.time - a.time);
      fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};
