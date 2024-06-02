"use strict";

import { Collection } from "@discordjs/collection";

import { Activity } from "./Activity";
import { Tools } from "./Tools";

import type { Player } from "./Activity";
import type { Room } from "./Room";

import type { TourUpdateData, TourEndData, EliminationBracket, RoundRobinBracket } from "../types/Tour";

// T is wheather the tournament is Elimination or Round Robin
export class Tournament<T extends EliminationBracket | RoundRobinBracket = EliminationBracket> extends Activity {
    data: TourUpdateData<T> & TourEndData<T>;
    format: string;
    isSingleElimination: boolean;
    type: T extends EliminationBracket ? "Elimination" : "Round Robin";
    round: {
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        name: keyof typeof Tools.generators | string;
        number: number;
    };
    playerCap: number;
    forceEnded: boolean = false;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    constructor(format: string, generator: string, playerCap: number, room: Room) {
        super(room);
        this.name = "Tournament-" + format;
        this.id = Tools.toRoomId(this.name);
        this.htmlPageBase = "";
        this.type = (generator.endsWith("Elimination") ? "Elimination" : "Round Robin") as (typeof this)["type"];
        this.data = {
            bracketData: {} as T,
            challengeBys: [],
            challenged: "",
            challenges: [],
            challenging: "",
            format: "",
            generator: "",
            isJoined: false,
            isStarted: false,
            playerCap: 0,
            results: [],
            teambuilderFormat: "",
        };
        let gen = (generator.replace(this.type, "").trim() || "Single") as (typeof this)["round"]["name"];
        if (!Object.keys(Tools.generators).includes(gen)) gen = generator.replace(this.type, ""); // like 20-tuple
        this.data.generator = generator;
        this.round = {
            name: gen,
            number: Tools.generators[gen as keyof (typeof Tools)["generators"]] ?? parseInt(gen.replace("-tuple", "")),
        };
        this.format = format;
        this.data.format = format;
        this.data.playerCap = playerCap;
        this.playerCap = playerCap;
        this.isSingleElimination = this.isElim() && this.round.number === 1;
    }

    update(data?: Partial<TourUpdateData<T> & TourEndData<T>>): this {
        if (data) Object.assign(this.data, data);
        this.type = (this.data.generator.endsWith("Elimination") ? "Elimination" : "Round Robin") as (typeof this)["type"];
        let gen = (this.data.generator.replace(this.type, "").trim() || "Single") as (typeof this)["round"]["name"] | string;
        if (!Object.keys(Tools.generators).includes(gen)) gen = this.data.generator.replace(this.type, ""); // like 20-tuple
        this.round = {
            name: gen,
            number: Tools.generators[gen as keyof (typeof Tools)["generators"]] ?? parseInt(gen.replace("-tuple", "")),
        };
        this.started = !!this.data.bracketData;
        this.playerCap = this.data.playerCap;
        this.isSingleElimination = this.isElim() && this.round.number === 1;
        this.room.update();
        return this;
    }

    isElim(): this is Tournament<EliminationBracket> {
        return this.type === "Elimination";
    }

    isRR(): this is Tournament<RoundRobinBracket> {
        return this.type === "Round Robin";
    }

    forceStart(): this {
        this.room.send("/tour start", { type: "command", measure: false });
        return this;
    }

    onStart(): this {
        this.started = true;
        this.signupsClosed = true;
        this.startTime = Date.now();
        return this;
    }

    forceEnd(): this {
        this.room.send("/tour end");
        return this;
    }

    onEnd(force?: boolean): this {
        this.ended = true;
        this.forceEnded = !!force;
        return this;
    }

    getWinner(): Player[] {
        if (!this.ended || this.forceEnded) return [];
        const players = new Collection<string, Player>().concat(this.players, this.pastPlayers);
        const maxScore = players.map((e) => e.score).reduce((p, c) => Math.max(c, p), -1 * players.size);
        return [...players.filter((e) => e.score === maxScore).values()];
    }
}
