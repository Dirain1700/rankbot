module.exports = message => {
  const path = require("path");
  const pool = require("workerpool").pool(path.join(__dirname, "./../../vm2/worker.js"), {
    workerType: "process",
  });
  const content = message.content.replace(">runjs ", "");
  const codeBlockRegex = /^`{2}(?<code>[\s\S]+)`{2}$/mu;
  
  const toMessageOptions = (consoleOutput, result) => {
    const wrapped = [
      "!code console:",
       consoleOutput.replaceAll("`", "`\u200b") || "No console output."
      ,
      "stdout:",
      result.replaceAll("`", "`\u200b"),
    ].join("\n");
    return wrapped;
  };
  
  if (!codeBlockRegex.test(content))
    return message.reply("Please send code!").catch(console.error);
  const code = content.match(codeBlockRegex)?.groups ?? {};
  
  pool
    .exec("run", [code.code])
    .timeout(5000)
    .then(([consoleOutput, result]) =>
      message.reply(toMessageOptions(consoleOutput, result))
    )
    .catch(error => message.reply("!code " + error));
};
