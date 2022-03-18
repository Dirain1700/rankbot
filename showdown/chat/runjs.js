module.exports = message => {
  const path = require("path");
  const pool = require("workerpool").pool(path.join(__dirname, "./../../vm2/worker.js"), {
    workerType: "process",
  });
  const content = message.content.substring(7);
  const codeBlockRegex = /^`{2}(?<code>[\s\S]+)`{2}$/mu;
  
  const toMessageOptions = (consoleOutput, result) => {
    let wrapped = result.replaceAll("`", "`\u200b");
    if (consoleOutput) {
      wrapped = [
        "!code console:",
        consoleOutput.replaceAll("`", "`\u200b"),
        "stdout:",
        wrapped
      ].join("\n");
      
      return wrapped;
    }
    if (!consoleOutput && wrapped.length <= 150) return "``" + wrapped + "``";
  };
  
  if (!codeBlockRegex.test(content))
    return message.reply("Please send code!").catch(console.error);
  const { code } = content.match(codeBlockRegex)?.groups ?? {};
  
  pool
    .exec("run", [code])
    .timeout(5000)
    .then(([consoleOutput, result]) =>
      message.reply(toMessageOptions(consoleOutput, result))
    )
    .catch(error => message.reply("``" + error + "``"));
};
