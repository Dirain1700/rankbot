"use strict";

import workerpool = require("workerpool");
import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (!message.isNotUnknown()) return;
    const pool = workerpool.pool("../../../../src/vm2/worker.js", {
        workerType: "process",
    });
    const content = message.content.substring(7);
    const codeBlockRegex = /^`{2}(?<code>[\s\S]+)`{2}$/mu;

    const toMessageOptions = (consoleOutput: string, result: string): string => {
        let wrapped = result.replaceAll("`", "`\u200b");
        if (consoleOutput) {
            wrapped = ["!code console:", consoleOutput.replaceAll("`", "`\u200b"), "stdout:", wrapped].join("\n");

            return wrapped;
        }
        if (!consoleOutput && wrapped.length <= 150) return "``" + wrapped + "``";
        return "";
    };

    if (!codeBlockRegex.test(content)) return void message.reply("Please send code!");
    const { code } = content.match(codeBlockRegex)?.groups ?? {};

    pool.exec("run", [code]) //prettier-ignore
        .timeout(5000)
        .then(([consoleOutput, result]: string[]) => message.reply(toMessageOptions(consoleOutput ?? "", result ?? "")))
        .catch((error: string) => message.reply("!code " + error));
};
