"use strict";

import { Collection } from "discord.js";

import { Activity } from "./client/src";

import type { Player, Room } from "./client/src";

export abstract class Game extends Activity {
    freejoin!: boolean;
    allowLateJoin?: boolean;
    timeLimit?: NodeJS.Timeout | undefined = undefined;
    signupsStartTime?: number;
    teams = new Collection<string, Player>();
    round?: number;
    inactiveRound?: number;
    roundTime?: number;
    playerCap?: number;
    scoreCap?: number;
    survival?: boolean;
    userHosted?: boolean;

    constructor(target: Room) {
        super(target);
    }

    abstract getStartHtml(): string;

    getSignupsHtml(): string {
        // prettier-ignore
        let html = "<div class=\"infobox\">";
        html += `<b>Players(${this.players.size}):&nbsp;`;
        html += this.players.map((p) => Tools.getUsernameHTML(p.name)).join(", ");
        html += "</b></div>";
        return html;
    }

    getSignupsEndMessage(): string {
        return "<center>(signups have closed)</center>";
    }
}
