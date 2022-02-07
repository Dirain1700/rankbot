module.exports = (client, ps) => {
  const log = message.content.replace("/log ", "");
  const messages = JSON.parse(fs.readFileSync("./../../config/log/chatlog.json"));
  let target;
  
  if ((config.log).includes(message.content)) {
    target = messages.filter(m => m.user == tool.toID(log.split(" was")[0]));
  }
  else if (message.content.indexOf("'s messages") !== -1) {
    target = messages.filter(m => m.user == tool.toID(log.split("'s messages")[0]));
  }
  else if (message.content.indexOf("was promoted") !== -1 ) {
    const targetUser = log.split(" was promoted")[0];
    client.channels.cache.get(config.logch).send(`${log}\nおめでとう、 ${targetUser}!`);
    return;
  }
  else if (message.content.indexOf("was demoted") !== -1) {
    return client.channels.cache.get(config.logch).send(log);
  }
  else return;
  const sendlog = target.map(i => `<t:${i.time}:T> ${i.user} : ${i.content}`);
  client.channels.cache.get(config.logch).send(log + "\n" + sendlog.join("\n"));
}
