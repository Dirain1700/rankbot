module.exports = (ps) => {
  const tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j help");
  });

  
  ps.on("message", message => {
    if (message.isIntro || message.type !== "chat" /*|| message.author.name === ps.status.username*/) return;
    logmsg(message);
    if (message.content.startsWith("/log") && config.log.includes(message.content)) {
      const log = message.content.replace("/log ", "");
      const msgs = JSON.parse(fs.readFileSync("./foo.json"));
      const target = msgs.filter(m => m.user == tool.toID(log.split(" was")[0]));
      console.log(target);
    }
    if (message.author.userid === "dirain") {
      if (message.content.startsWith(".echo")) {
        ps.send(`${message.target.roomid}|${message.content.replace(".echo ", "")}`);
        return;
      }
    }
    
  });

    function logmsg(message) {
      const add = {
        "time": message.time,
        "user": message.author.userid,
        "content": message.content
      };
      const json = JSON.parse(fs.readFileSync("./foo.json"));
      json.push(add);
      json.sort((a, b) => b.time - a.time);
      fs.writeFileSync("./foo.json", JSON.stringify(json, null, 2));
    }
  
  function whatislog(message) {
    const msgs = JSON.parse(fs.readFileSync("./foo.json"));
    if (!config.log.includes(message.content)) return;
    const target = msgs.filter(m => m.user == message.content.split(" ")[0]);
    console.log(target.filter(r => r.time <= message.time));
    
  }
};
