"use strict";

import type { Message, User } from "@dirain/client";

export default (message: Message<User>): void => {
    if (message.author.userid !== config.owner || message.author.group === " ") return;
    const targetRoom = message.content.substring(7);
    message.client.send("|/j " + targetRoom);
    message.reply(`Joined room "${targetRoom}"`);
};
