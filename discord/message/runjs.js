module.exports = message => {
  /*Forked from https://github.com/InkoHX/vm2-discordjs*/
  const { MessageAttachment, MessagePayload } = require("discord.js");
  const { codeBlock } = require("@discordjs/builders");
  require(".../vm2/msg");
  const path = require("path");
  const pool = require("workerpool").pool(path.join(__dirname, ".../vm2/worker.js"), {
    workerType: "process",
  });
  
  const codeBlockRegex = /^`{3}(?<language>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
  const languages = ["js", "javascript"];
  const toMessageOptions = content => {
    if (content.length <= 2000)
      return codeBlock("js", content);
    else{
      const file = new MessageAttachment(Buffer.from(content), "result.txt");
      return MessagePayload.create(message.channel, {
        content: "実行結果が長すぎるのでテキストファイルに出力しました。",
        files: [file]
      });
    }
  };
  if (!codeBlockRegex.test(message.content))
    return message.reply("コードを送信してください。").catch(console.error);
  
  const { language, code } = message.content.match(codeBlockRegex)?.groups ?? {};
  if (!languages.includes(language))
    return message
      .reply(`言語識別子が**${languages.join(", ")}**である必要があります。`)
      .catch(console.error);
  pool
    .exec("run", [code])
    .timeout(5000).then(result => message.sendDeletable(toMessageOptions(result)))
    .catch(error => message.sendDeletable(codeBlock("js", error)));
};
/*End of fork*/
