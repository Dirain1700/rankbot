"use strict";

import { formatNameList } from "./formatnames";
import type { Message, Room } from "@dirain/client";

export default (message: Message<Room>): void => {
    const choice = Math.floor(Math.random() * formatNameList.length);
    const result = formatNameList[choice];

    message.reply(`/tour new ${result}, elim`);
    message.target.send(`/adduhtml pickedtour, <div class="infobox"><em>We randomly picked:</em> ${result}</div>`);
    if (result === "[Gen 8] Battle Stadium Singles") {
        const cmd = ["/tour rules VGC Timer", "/tour name [Gen 8] Battle Stadium Singles"];
        setTimeout(message.reply.bind(message), PS.messageInterval, cmd.join("\n"));
    }
};
