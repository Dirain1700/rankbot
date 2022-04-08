module.exports = (message) => {
    /*Forked from https://github.com/InkoHX/vm2-discordjs*/
    const { MessageAttachment } = require("discord.js");
    const Formatters = require("@discordjs/builders");
    require("./../../vm2/msg");
    const path = require("path");
    const pool = require("workerpool").pool(path.join(__dirname, "../../vm2/worker.js"), {
        workerType: "process",
    });

    const codeBlockRegex = /^`{3}(?<language>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
    const languages = ["js", "javascript"];

    const toMessageOptions = (consoleOutput, result) => {
        if (consoleOutput.split("\n").length <= 100) {
            let wrapped = Formatters.codeBlock("js", result.replaceAll("`", "`\u200b"));
            if (consoleOutput) {
                wrapped =
                    Formatters.bold("console:") +
                    Formatters.codeBlock("js", consoleOutput.replaceAll("`", "`\u200b")) +
                    "\n" +
                    Formatters.bold("stdout:") +
                    wrapped;
            }
            if (wrapped.length <= 2000) return wrapped;
        }
        const files = [new MessageAttachment(Buffer.from(result), "result.txt")];
        if (consoleOutput) files.unshift(new MessageAttachment(Buffer.from(consoleOutput), "console.txt"));
        return {
            content: "実行結果が長すぎるのでテキストファイルに出力しました。",
            files,
        };
    };

    if (!codeBlockRegex.test(message.content)) return message.reply("コードを送信してください。").catch(console.error);

    const { language, code } = message.content.match(codeBlockRegex)?.groups ?? {};
    if (!languages.includes(language))
        return message //prettier-ignore
            .reply(`言語識別子が**${languages.join(", ")}**である必要があります。`)
            .catch(console.error);

    pool.exec("run", [code]) //prettier-ignore
        .timeout(5000)
        .then(([consoleOutput, result]) => message.sendDeletable(toMessageOptions(consoleOutput, result)))
        .catch((error) => message.sendDeletable(Formatters.codeBlock("js", error)));
};
/*End of fork*/
