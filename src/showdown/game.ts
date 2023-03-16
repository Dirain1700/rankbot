"use strict";

import { Activity } from "@dirain/client";
import { Collection } from "discord.js";

import type { Player } from "@dirain/client";

export abstract class Game extends Activity {
    freejoin!: boolean;
    allowLateJoin?: boolean;
    timeLimit?: number;
    signupsStartTime?: number;
    teams = new Collection<string, Player>();
    round?: number;
    inactiveRound?: number;
    roundTime?: number;
    playerCap?: number;
    scoreCap?: number;
    survival?: boolean;
    userHosted?: boolean;

    abstract getStartHtml(): string;

    getSignupsHtml(): string {
        // prettier-ignore
        let html = "<div class=\"infobox\">";
        html += `<b>Players(${this.players.size}):&nbsp;`;
        html += this.players.map((p) => "<username>" + Tools.escapeHTML(p.name) + "</username>").join(", ");
        html += "</b></div>";
        return html;
    }

    getSignupsEndMessage(): string {
        return "<center>(signups have closed)</center>";
    }
}
