module.exports = (client, ps) => {
  const tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    ps.send("|/j botdev");
  });
  
  ps.on("message", async message => {
    if (message.type !== "pm" || message.author.name === ps.status.username) return;
    if (message.author.userid === "dirain" || message.author.group === " "){
      if (message.content.startsWith("/invite")) {
        const targetRoom = message.content.replace("/invite ", "");
        console.log(targetRoom);
        ps.send("|/j " + targetRoom);
        await message.reply(`Joined room "${targetRoom}"`);
      }
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat" || message.author.name === ps.status.username) return;
    if (message.target.roomid == "japanese") logmsg(message);
    if (message.content.startsWith("/log") && (message.target.roomid).includes("japanese")){
      const log = message.content.replace("/log ", "");
      const messages = JSON.parse(fs.readFileSync("./config/log/chatlog.json"));
      let target;
      if ((config.log).includes(message.content)) {
        target = messages.filter(m => m.user == tool.toID(log.split(" was")[0]));
      }
      if (message.content.indexOf("'s messages") !== -1) {
        target = messages.filter(m => m.user == tool.toID(log.split("'s messages")[0]));
      }
      if (message.content.indexOf("was promoted") !== -1 ) {
        const targetUser = log.split(" was promoted")[0];
        client.channels.cache.get(config.logch).send(`${log}\nおめでとう、 ${targetUser}!`);
        return;
      }
      if (message.content.indexOf("was demoted")) {
        return client.channels.cache.get(config.logch).send(log);
      }
      console.log(target);
      const sendlog = target.map(i => `<t:${i.time}:T> ${i.user} : ${i.content}`);
        client.channels.cache.get(config.logch).send(log + "\n" + sendlog.join("\n"));
    }
    if (message.content.toLowerCase().startsWith(">runjs")) {
      const path = require("path");
      const pool = require("workerpool").pool(path.join(__dirname, "./vm2/worker.js"), {
        workerType: "process",
      });
      const content = message.content.replace(">runjs ", "");
      const codeBlockRegex = /^`{2}(?<code>[\s\S]+)`{2}$/mu;
      const toMessageOptions = result => {
        if (result.length <= 2000)
          return "``" + result + "``";
        else return "too long result.";
      };
      if (!codeBlockRegex.test(content))
        return message.reply("Please send code!").catch(console.error);
      const code = content.match(codeBlockRegex)?.groups ?? {};
      
      pool
        .exec("run", [code.code])
        .timeout(5000)
        .then(result => message.reply(toMessageOptions(result)))
        .catch(error => message.reply("``" + error + "``"));
    }
    /*End of fork*/
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
      fs.writeFileSync("./config/log/chatlog.json", JSON.stringify(json, null, 2));
    }
  
};
