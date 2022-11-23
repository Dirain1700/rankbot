"use strict";

// prettier-ignore
export const blank = "<div style=\"width: 12.5%; height: 12.5%; margin: 1%; position: relative; box-sizing: border-box; background: #ffffff; border: 0.3vw solid #cccccc\"><div style=\"display: block; padding-bottom: 100%;\"></div></div>";

// prettier-ignore
export const incorrect = (str: string) => `<div style="width: 12.5%; height: 12.5%; margin: 1%; position: relative; background: #787c7f;"><div style="display: block; padding-bottom: 100%;"><span style="font-wight: bold; font-size: 4vw; color: #ffffff; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">${str}</span></div></div>`;

// prettier-ignore
export const correct = (str: string) => `<div style="width: 12.5%; height: 12.5%; margin: 1%; position: relative; background: #69aa64;"><div style="display: block; padding-bottom: 100%;"><span style="font-wight: bold; font-size: 4vw; color: #ffffff; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">${str}</span></div></div>`;

// prettier-ignore
export const notHere = (str: string) => `<div style="width: 12.5%; height: 12.5%; margin: 1%; position: relative; background: #c9b457;"><div style="display: block; padding-bottom: 100%;"><span style="font-wight: bold; font-size: 4vw; color: #ffffff; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">${str}</span></div></div>`;
