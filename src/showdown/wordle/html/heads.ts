"use strict";

// prettier-ignore
export const head = "<div style=\"max-width: 36vw; height: 36vw;\">";

export const closeDiv = "</div>";

// prettier-ignore
export const partsHead = "<div style=\"display: flex; flex-wrap: wrap\">";

// prettier-ignore
export const form = (room: string) => `<div style="max-height: 5%; margin: 3%; box-sizing: border-box"><form data-submitsend="/msgroom japanese,/botmsg ${PS.status.id},?guess ${room},{guess}" id="guess"><input type="text" id="guess" name="guess"><button class="button" type="send">Guess!</button></form></div>`;

export const correctNotice = (time: number) =>
    `<span style="font-weight: bold; font-size: 1.2vw;">You guessed correctly in ${time}${
        time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"
    } time!</span>`;

// prettier-ignore
export const incorrectNotice = (ans: string) => `<span style="font-weight: bold; font-size: 1.2vw;">Incorrect! You failed to guess! The answer was: ${ans} !</span>`;
