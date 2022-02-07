module.exports = message => {
  const path = require("path");
  const pool = require("workerpool").pool(path.join(__dirname, "./../../vm2/worker.js"), {
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
