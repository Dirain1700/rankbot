"use strict";

import { Tools } from "@dirain/client";
import type { Room, User, Client } from "@dirain/client";

import { blank, incorrect, correct, notHere } from "./html/main";
import { head, closeDiv, partsHead, form, correctNotice, incorrectNotice } from "./html/heads";
import type { StoredWordleDataType, GuessType, WordlePlayer, EndedPlData } from "../../../types/wordle";

export class Wordle {
    pl: Map<string, WordlePlayer>;
    room: Room;
    answer: string;
    client: Client;
    endedPl: string[]; // User ID[]
    correctedPl: Map<string, EndedPlData>; // Map<User ID, WordleData>
    eliminatedPl: Map<string, EndedPlData>; // Map<User ID, WordleData>;

    constructor(room: Room) {
        const str = "abcdefghijklmnopqrstuvwxyz";
        const firstStr = str[~~(Math.random() * str.length)];
        const pick = (arr: string[]): string => arr[~~(Math.random() * arr.length)] as string;
        const words = fs.readFileSync(`./src/showdown/wordle/words/${firstStr}.txt`, "utf-8").split("\n");
        const word = pick(words);

        this.answer = word;
        this.room = room;
        this.client = room.client;
        this.pl = new Map();
        this.endedPl = [];
        this.correctedPl = new Map();
        this.eliminatedPl = new Map();
    }

    rebuild(data: StoredWordleDataType, room: Room) {
        this.answer = data.answer;
        this.room = room;
        this.client = room.client;
        this.pl = new Map(data.pl);
        this.endedPl = data.endedPl;
        this.correctedPl = new Map(data.correctedPl);
        this.eliminatedPl = new Map(data.eliminatedPl);
    }

    generate(pl: string, guess?: GuessType): string {
        pl = Tools.toId(pl);
        if (this.endedPl.includes(pl)) {
            const cData = this.correctedPl.get(pl);
            const eData = this.eliminatedPl.get(pl);
            if (cData) return head + cData.html + correctNotice(cData.round) + closeDiv;
            else if (eData) return head + eData.html + incorrectNotice(this.answer) + closeDiv;
            else return "";
        }
        const blankLine = partsHead + blank.repeat(5) + closeDiv;
        let html = "";
        const playerData = this.pl.get(pl) ?? { round: 0, html: "" };
        const { html: pHTML, round } = playerData;

        switch (round) {
            case 0: {
                html += blankLine.repeat(6);
                this.pl.set(pl, { round: 1, html });
                html += form(this.room.id);
                break;
            }

            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6: {
                let line = partsHead;
                // prettier-ignore
                if (!guess) return head + pHTML + form(this.room.id) + closeDiv;
                let i: number = 0;

                for (const ans of guess) {
                    const [gStr, result] = ans;
                    let square = "";

                    switch (result) {
                        case "T": {
                            square = correct(gStr);
                            i++;
                            break;
                        }

                        case "F": {
                            square = incorrect(gStr);
                            break;
                        }

                        case "P": {
                            square = notHere(gStr);
                            break;
                        }
                    }

                    if (!square) throw new Error();

                    line += square;
                }

                line += closeDiv;

                html += pHTML.replace(blankLine, line);

                if (playerData.round !== 6) this.pl.set(pl, { round: round + 1, html });

                const isCorrect = i === 5;
                if (isCorrect) {
                    const user = this.client.users.cache.get(pl);
                    if (!user) break;
                    this.destroy(user, { round, html }, true);
                    html += correctNotice(round);
                } else if (round === 6) {
                    const user = this.client.users.cache.get(pl);
                    if (!user) break;
                    this.destroy(user, { round, html }, false);
                    html += incorrectNotice(this.answer);
                } else html += form(this.room.id);
                break;
            }
        }

        html = head + html;
        html += closeDiv;
        return html;
    }

    checkAns(guess: string, pl: string) {
        const guessArray = Tools.toId(guess).toUpperCase().split("");
        const answerArray = Tools.toId(this.answer).toUpperCase().split("");
        const result: GuessType = [];

        for (let i = 0; i <= 4; i++) {
            const str = guessArray[i] as string;
            const isCorrect = answerArray[i] === str;
            const isInvalid = ((): boolean => {
                if (!answerArray.includes(str)) return true;
                else {
                    const arr: number[] = [];
                    for (let n = 0; n <= 4; n++) {
                        if (guessArray[n] === str) arr.push(n);
                    }
                    return !arr.every((e) => e <= i);
                }
            })();
            result.push([str, isCorrect ? "T" : isInvalid ? "F" : "P"]);
        }

        return this.generate(pl, result);
    }

    destroy(user: User, data: WordlePlayer, correct: boolean): void {
        const { html, round } = data;
        const { id, name } = user;
        if (correct) {
            this.correctedPl.set(id, { name, html, round });
            this.endedPl.push(user.id);
            this.pl.delete(id);
        } else if (!correct) {
            this.eliminatedPl.set(id, { name, html, round });
            this.endedPl.push(user.id);
            this.pl.delete(id);
        } else throw new Error();
    }

    commend(): [string, number][] {
        const arr: [string, number][] = []; // [User ID, time]
        [...this.correctedPl.values()].forEach((e) => arr.push([e.name, e.round]));
        return arr;
    }

    store(): StoredWordleDataType {
        const { answer, pl, correctedPl, eliminatedPl, endedPl } = this;
        return {
            answer,
            pl: Array.from(pl.entries()),
            endedPl,
            correctedPl: Array.from(correctedPl.entries()),
            eliminatedPl: Array.from(eliminatedPl.entries()),
        };
    }
}
