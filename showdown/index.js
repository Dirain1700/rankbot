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
       require("./global/resetlog")(message);
    }
    if (message.content.startsWith(".hotpatch")) {
      require("./global/hotpatch")(message);
    }
    if (message.content.startsWith("echo") && message.author.userid === config.owner)
      ps.send(message.content.substring(4));
    if (message.content.startsWith(".output")) {
      require("./global/output")(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "pm" /* ||message.author.userid === ps.status.userid*/) return;
    if (message.content.startsWith("/invite")) {
			require("./pm/invite")(message);
    }
    if (message.content.startsWith(">runjs")) {
      require("./chat/runjs")(message);
    }
    if (message.content === "process.exit(0)" && message.author.userid === config.owner) process.exit(0);
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat") return;
    if (message.target.roomid.includes("japanese")) logmsg(message);
    if (message.content.startsWith("/log") && message.target.roomid.includes("japanese")) {
      require("./chat/sendlog")(client, message);
    }
    if (message.content.startsWith(">runjs")) {
      require("./chat/runjs")(message);
    }
    if (message.content.startsWith(".nt")) {
      if (!message.author.isStaff("room", message.target)) return;
      require("./tour/tourmanager")(message);
    }
  });

	ps.on("raw", function(room, html, isIntro) {
		const { Message } = require("ps-client").classes;
		const message = new Message({
			by: "~",
			text: html,
			type: "chat",
			target: room,
			raw: "|raw|" + html,
			isIntro: isIntro,
			parent: this,
			time: Date.now()
		});
		if (message.isIntro) return;
		require("./chat/raw")(message);
	});

	ps.on("tournament", function (room, msg, isIntro) {
		if (isIntro || !room.indexOf("japanese")) return;
		const event = msg.split("|")[0];
		if (event === "create") {
			["autostart 5", "autodq 2", "scouting disallow"].forEach(e => ps.send(`${room}|/tour ${e}`));
		}
		if (event === "end")
			ps.send("!code " + JSON.parse(msg.split("|").slice(1).join("|")));
	});

  function logmsg(message) {
    const msgtime = Math.floor((message?.time ?? Date.now()) / 1000);
    const add = {
      "time": msgtime,
      "user": message.author?.userid ?? "&",
      "content": message.content
    };
    const file = path.resolve(__dirname, "./../config/chatlog.json");
    let json = JSON.parse(fs.readFileSync(file));
		if (json.length > 500) json.length = 50;
		json.unshift(add);
		fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};
