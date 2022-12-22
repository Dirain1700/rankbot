"use strict";

import { createGame, rerollPokemon, endGame } from "./game";
import type { Message } from "@dirain/client";

export default (message: Message<unknown>): void => {
    if (!message.isRoomMessage()) return;
    const { author, content, target } = message;
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (
        (!target.isStaff(author) && !target.isVoice(author.id) && !author.isGlobalVoice && author.id !== config.owner) ||
        !target.isBot(PS.status.id!)
    )
        return;
    /* eslint-enable */
    const subcommand = Tools.toId(content.replace("?game ", "").split(" ")[0] ?? "");
    const name = Tools.toId(content.replace("?game ", "").split(" ").slice(1).join(" ").split(",")[0] ?? "");
    const rules = (content.replace("?game ", "").split(" ").slice(1).join(" ").split(",").slice(1) ?? []).map((e) =>
        e.toLowerCase().replace(/[^a-z0-9-+!= ]/g, "")
    );
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let fanc: ((...arg: any) => any) | null = null;
    let arg: any[] | null = null;
    /* eslint-enable */

    switch (subcommand) {
        case "new":
        case "create":
            fanc = createGame;
            arg = [name, target];
            if (rules.length) arg.push(rules);
            break;
        case "reroll":
        case "rerollpokemon":
            fanc = rerollPokemon;
            arg = [name, target];
            if (rules.length) arg.push(rules);
            break;
        case "end":
        case "endgame":
            fanc = endGame;
            arg = [target];
    }

    if (!fanc || !arg || !arg.length) return;
    fanc(...arg);
};
