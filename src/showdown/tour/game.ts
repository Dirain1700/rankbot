"use strict";

import type { Room } from "@dirain/client";

export const GameList = ["Same Solo", "Same Duo", "Same Six"] as const;

export const GameIdList = ["samesolo", "sameduo", "samesix"] as const;

interface IGame {
    name: typeof GameList[number];
    Pokemon: number;
    tier: string;
}

export const Game = {
    samesolo: {
        name: "Same Solo",
        Pokemon: 1,
        tier: "[Gen 8] 1v1",
    },
    sameduo: {
        name: "Same Duo",
        Pokemon: 2,
        tier: "[Gen 8] 2v2 Doubles",
    },
    samesix: {
        name: "Same Six",
        Pokemon: 6,
        tier: "[Gen 8] OU",
    },
} as const satisfies { [key in typeof GameIdList[number]]: IGame };

export function isValidGame(name: string): name is keyof typeof Game {
    return Object.keys(Game).includes(name);
}

export const createGame = (gameName: string, room: Room, rules?: string[]): void => {
    gameName = Tools.toId(gameName);
    if (!isValidGame(gameName)) return;
    if (!Game[gameName]) return void room.send("No tournament data found.");
    const { name, Pokemon, tier } = Game[gameName];
    const command = [];
    room.send(`/tour new ${tier}, elim`);

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const mons = Dex.filter((e) => !e.evos && !e.forme)
        .random(Pokemon)
        .map((e) => e.name);
    const boldMons = mons.map((e) => "**" + e + "**");

    const gameRules: string[] = rules ?? [];
    gameRules.push("-All Pokemon");
    mons.forEach((e) => gameRules.push("+" + e));

    command.push(`${room.id}|/tour rules ${gameRules.join(",")}`);
    command.push(`${room.id}|/tour name ${name}`);

    command.push(
        `${room.id}|/announce This is ${name} tournament! Only these ${mons.length} Pokémons allowed: ${
            mons.length > 1 ? boldMons.slice(0, -1).join(", ") + " and " + boldMons.at(-1) : boldMons[0]
        }`
    );
    /* eslint-enable */

    PS.sendArray(command);
};

export const rerollPokemon = (gameName: string, room: Room, rules?: string[]): void => {
    if (!isValidGame(Tools.toId(gameName))) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Pokemon } = Game[Tools.toId(gameName) as any as typeof GameIdList[number]];
    const mons = Dex.filter((e) => !e.evos && !e.forme)
        .random(Pokemon)
        .map((e) => e.name);
    const newRule = rules ?? [];
    newRule.push("-All Pokemon");
    mons.forEach((e) => newRule.push("+" + e));
    const boldMons = mons.map((e) => "**" + e + "**");
    room.send(
        `/announce Rerolled Pokémons: ${mons.length > 1 ? boldMons.slice(0, -1).join(", ") + " and " + boldMons.at(-1) : boldMons[0]}`
    );
    room.send(`/tour rules ${newRule.join(",")}`);
};

export const endGame = (room: Room) => {
    room.send("/tour end");
    room.send("/announce The game was forcibly ended.");
};
