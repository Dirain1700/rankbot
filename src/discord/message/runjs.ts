import { AttachmentBuilder, bold, codeBlock } from "discord.js";
import type { Message, ReplyMessageOptions } from "discord.js";
import workerpool = require("workerpool");

export default (message: Message): void => {
    const pool = workerpool.pool("../../../../vm2/worker.js", {
        workerType: "process",
    });

    const codeBlockRegex = /^`{3}(?<language>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
    const languages = ["js", "javascript"];
    const toMessageOptions = (consoleOutput: string, result: string): ReplyMessageOptions => {
        if (consoleOutput.split("\n").length <= 100) {
            let wrapped: string = codeBlock("js", result.replaceAll("`", "`\u200b"));
            if (consoleOutput) {
                wrapped = bold("コンソール") + codeBlock("js", consoleOutput.replaceAll("`", "`\u200b")) + "\n" + bold("結果") + wrapped;
            }
            if (wrapped.length <= 2000) return { content: wrapped, allowedMentions: { repliedUser: true } };
        }
        const files = [new AttachmentBuilder(Buffer.from(result), { name: "result.txt" })];
        if (consoleOutput) files.unshift(new AttachmentBuilder(Buffer.from(consoleOutput), { name: "console.txt" }));
        return {
            content: "実行結果が長すぎるのでテキストファイルに出力しました。",
            files,
        };
    };
    if (!codeBlockRegex.test(message.content)) return void message.reply("コードを送信してください。").catch(console.error);

    const { language, code } = message.content.match(codeBlockRegex)?.groups ?? {};
    if (!language || !languages.includes(language))
        return void message.reply(`言語識別子が**${languages.join(", ")}**である必要があります。`).catch(console.error);

    pool.exec("run", [code])
        .timeout(5000)
        .then(([consoleOutput, result]: string[]) => message.sendDeletable(toMessageOptions(consoleOutput ?? "", result ?? "")))
        .catch((error: unknown) => message.sendDeletable(codeBlock("js", error as string)));
};
