module.exports = (client, ps, message) => {
  const log = message.content.replace("/log ", "");
  const file = path.resolve(__dirname, "./../../config/chatlog.json");
  const messages = JSON.parse(fs.readFileSync(file));
  let target;
  
  if ((config.log).includes(message.content)) {
    target = messages.filter(m => m.user == tool.toID(log.split(" was")[0]));
  }
  else if (~message.content.indexOf("'s messages")) {
    target = messages.filter(m => m.user == tool.toID(log.split("'s messages")[0]));
  }
  if (message.target.roomid !== "japanese") return;
  else if (~message.content.indexOf("was promoted")) {
    const targetUser = log.split(" was promoted")[0];
    client.channels.cache.get(config.logch).send(`${log}\nおめでとう、${targetUser}!`);
    return;
  }
  else if (~message.content.indexOf("was demoted")) {
    return client.channels.cache.get(config.logch).send(log);
  }
  if (!target) return;
  const chatLog = target.map(i => `<t:${i.time}:T> ${i.user}: ${i.content}`);
  client.channels.cache.get(config.logch).send(log + "\n" + chatLog.join("\n"));
};
