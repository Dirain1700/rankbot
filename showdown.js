module.exports = (ps) => {
  const tool = require("ps-client").Tools;
  ps.once("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("japanese|")
    ps.send("|/j groupchat-japanese-23682375")
  });

  
  ps.on("message", message => {
    if (message.isIntro /*|| message.author.name === ps.status.username*/) return;
    console.log(message.author.rank + message.author.id + ": " + message.content)
    if (message.content.startsWith("/log") && (config.log.includes(message.content) || message.content.indexOf(config.hide) !== -1)) {
      console.log("event emitted.")
      const log = message.content.replace("/log ", "");
      //client.channels.cache.get(config.logch).send(log)
      console.log(whatislog(message));
    }
    if (message.content.startsWith(".echo") && message.type === "chat") {
      if (message.author.userid !== "dirain") return;
      //ps.send(`${message.target.roomid}|${message.content.replace(".echo ", "")}`)
    }
    logmsg();
  });

    function logmsg(message) {
      const rank = message.author.rank;
      const spl = message.raw.split("|")
      let add;
      switch (["^", "+", "$", "*", "%", "@", "#", "&"].includes(rank)) {
        case false:
          add = {
            "time": spl[2],
            "user": message.author.id,
            "content": message.content
          }
          break;
        case true:
          add = {
            "time": spl[2],
            "user": message.author.rank + message.author.id,
            "content": message.content
          }
          break;
      }
      const json = JSON.parse(fs.readFileSync("./foo.json"))
      json.push(add)
      json.sort((a, b) => b.time - a.time);
      fs.writeFileSync("./foo.json", JSON.stringify(json, null, 2)
    };
  
  function whatislog(message) {
    const msgs = JSON.parse(fs.readFileSync("./foo.json"));
    if (config.log.includes(message.content)) {
      return msgs.filter(m => m.user == message.content.split(" ")[0]);
//console.log(target.filter(r => r.time <= spl[2]))
    }else if (message.content.indexOf(config.hide)) {
      const first = message.content.split(" ")[0];
      if (Number.isNaN(first)) {
        return msgs.filter(m => m.user == message.content.split(" ")[0].replace("'s", ""));
      }
      if (!Number.isNaN(first)) {
        return msgs.filter(m => m.user == message.content.split(" ")[2].replace("'s", ""));
        }
      }
  }
}
