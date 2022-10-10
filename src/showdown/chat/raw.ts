"use strict";

import type { Room } from "@dirain/client";

export default (message: string, room: Room): void => {
    const modchatRegex =
        /<div class="broadcast-red"><strong>Moderated chat was set to (?<level>(off|autoconfirmed|trusted|\+|%|@|\*|player|#|&))!<\/strong><br \/>Only users of rank (off|autoconfirmed|trusted|\+|%|@|\*|player|#|&) and higher can talk.<\/div>/;
    if (!message.match(modchatRegex)) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { level } = message.match(modchatRegex)!.groups ?? {};
    if (!level || !["off", "autoconfirmed"].includes(level)) {
        room.send("!rfaq modchat");
    }
};
