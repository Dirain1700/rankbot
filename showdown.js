module.exports = (client, ps) => {
  const tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j botdev");
    ps.send("|/j groupchat-japanese-71940624");
  });
  
  ps.on("message", message => {
    if (message.isIntro || message.type !== "chat" /*|| message.author.name === ps.status.username*/) return;
    if (message.target.roomid == "japanese") logmsg(message);
    if (message.content.startsWith("/log")) {
      const log = message.content.replace("/log ", "");
      const msgs = JSON.parse(fs.readFileSync("./config/log/chatlog.json"));
      let target;
      if (config.log.incluedes(message.content))
        target = msgs.filter(m => m.user == tool.toID(log.split(" was")[0]));
      if (message.contnt.indexOf("'s messages") != -1)
        target = msgs.filter(m => m.user == tool.toID(log.split("'s messages")[0]));
      if (message.content.indexOf("was promoted")) {
        const targetUser = message.content.split(" was promoted")[0];
        client.channels.cache.get(config.logch).send(`${log}\nおめでとう、 ${targetUser}!`);
        return;
      }
      const sendlog = target.map(i => `<t:${i.time}:T> ${i.user} : ${i.content}`);
        client.channels.cache.get(config.logch).send(log + "\n" + sendlog.join("\n"));
    }
    if (message.author.userid === "dirain") {
      if (message.content.startsWith(".echo")) {
        ps.send(`${message.target.roomid}|${message.content.replace(".echo ", "")}`);
        return;
      }else if (message.content === ".resetlog" && message.target.roomid === "japanese") {
        ps.send(`japanese|ログの削除が完了しました。`);
        setTimeout(() => {
          fs.writeFileSync("./config/log/chatlog.json", "[]");
        }, 500);
      }
      if (message.content.startsWith("process.exit")) {
        process.exit(0);
      }
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
      fs.writeFileSync("./foo.json", JSON.stringify(json, null, 2));
    }
  
};
