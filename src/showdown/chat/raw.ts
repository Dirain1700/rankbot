"use strict";

import type { Message, Room } from "@dirain/client";

export default (message: Message<Room>): void => {
    const modchatRegex =
        /<div class="broadcast-red"><strong>Moderated chat was set to (?<modchatLevel>(off|autoconfirmed|trusted|\+|%|@|\*|player|#|&))!<\/strong><br \/>Only users of rank (off|autoconfirmed|trusted|\+|%|@|\*|player|#|&) and higher can talk.<\/div>/;
    if (modchatRegex.test(message.content)) {
        message.target.send("!rfaq modchat");
    }
};
