module.exports = (ps, client) => {
  require("./structures");
  global.tool = require("ps-client").Tools;
  
  ps.on("loggedin", async () => {
    console.log("Logged in as " + config.ops.username);
  });
  
  ps.on("message", message => {
    if (message.isIntro || message.author.userid === ps.status.userid) return;
    if (message.content === "help?"){
      if (message.type === "chat" && !message.author.isStaff("room", message.target)) return;
      message.reply("Dirain1700~! Guide: https://github.com/Dirain1700/rankbot#readme");
    }
    if (message.content === ".resetlog") {
      const run = require("./global/resetlog");
      run(message);
    }
    if (message.content.startsWith(".hotpatch")) {
      const run = require("./global/hotpatch");
      run(message);
    }
    if (message.content.startsWith("echo") && message.author.userid === config.owner)
      ps.send(message.content.substring(4));
    if (message.content.startsWith(".output")) {
      const run = require("./global/output");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "pm" /* ||message.author.userid === ps.status.userid*/) return;
    if (message.content.startsWith("/invite")) {
      const run = require("./pm/invite");
      run(ps, message);
    }
    if (message.content.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    if (message.content === "process.exit(0)" && message.author.userid === "dirain") process.exit(0);
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
    if (message.content.startsWith(".nt")) {
      if (!message.author.isStaff("room", message.target)) return;
      const run = require("./tour/tourmanager");
      run(message);
    }
		if (message.content.startsWith("/raw")) {
			const run = require("./chat/raw.js");
			run(message);
		}
  });
/*
	ps.on("raw", (room, message, args, isIntro) => {
	})
*/
  function logmsg(message) {
    const msgtime = Math.floor((message?.time ?? Date.now()) / 1000);
    const add = {
      "time": msgtime,
      "user": message?.author?.userid ?? "&",
      "content": message.content
    };
    const file = path.resolve(__dirname, "./../config/chatlog.json");
    let json = JSON.parse(fs.readFileSync(file));
		if (json.length > 500) json.length = 50;
		json.unshift(add);
		fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};
