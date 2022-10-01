"use strict";

import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (!message.isNotUnknown() || message.author.userid !== config.owner) return;
    if (message.isRoomMessage() && !message.target.id.includes("japanese")) return;
    message.reply("ログの削除が完了しました。");
    const file = "../../../config/chatlog.json";
    setTimeout(() => {
        fs.writeFileSync(file, "[]");
    }, 500);
};
