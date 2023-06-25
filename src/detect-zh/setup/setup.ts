"use strict";

import * as fs from "fs";
import * as path from "path";

import { execSync } from "./tools";

const UnihanURL = "http://www.unicode.org/Public/UNIDATA/Unihan.zip";
const dataDirectory = path.resolve(__dirname, "../../../../data/Unihan");
const UnihanZipFileIndex = path.join(dataDirectory, "Unihan.zip");
const UnihanUnzipDirectory = path.join(dataDirectory, "Unihan");
const UnihanReadingsIndex = path.join(UnihanUnzipDirectory, "Unihan_Readings.txt");
const distributedCodesDirectory = path.join(dataDirectory, "result");
const JapaneseCodesEntryPoint = path.join(distributedCodesDirectory, "japanese.txt");
const ChineseCodesEntryPoint = path.join(distributedCodesDirectory, "chinese.txt");
const NEW_LINE = "\n";
const SPACE = "\t";
const HASH = "#";

execSync("mkdir -p " + dataDirectory);
execSync("wget " + UnihanURL + " -O " + UnihanZipFileIndex);
execSync("unzip Unihan.zip -d " + UnihanUnzipDirectory, { cwd: dataDirectory });

const UnihanReadings = fs.readFileSync(UnihanReadingsIndex, "utf-8");

const JapaneseKun: string[] = [];
const JapaneseOn: string[] = [];
const Mandarin: string[] = [];
const Cantonese: string[] = [];

for (const line of UnihanReadings.split(NEW_LINE)) {
    if (line.startsWith(HASH)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const splitLines: [string, string, ...string[]] = line.trim().split(SPACE) as any as [string, string, ...string[]];
    const [stringCode, stringType] = splitLines;
    switch (stringType) {
        case "kJapaneseKun": {
            JapaneseKun.push(stringCode);
            break;
        }

        case "kJapaneseOn": {
            JapaneseOn.push(stringCode);
            break;
        }

        case "kMandarin": {
            Mandarin.push(stringCode);
            break;
        }

        case "kCantonese": {
            Cantonese.push(stringCode);
            break;
        }

        default:
            continue;
    }
}

console.log();
console.log("----------------- Extracted logs ------------------");
console.log();
console.log("Japanese Kun pronunciations:", JapaneseKun.length);
console.log("Japanese On  pronunciations:", JapaneseOn.length);
console.log("Mandarin     pronunciations:", Mandarin.length);
console.log("Cantonese    pronunciations:", Cantonese.length);
console.log();
console.log("---------------------------------------------------");
console.log();

const Japanese: number[] = Array.from(new Set([...JapaneseKun, ...JapaneseOn])).map((e) => parseInt(e.slice(2), 16));
const Chinese: number[] = Array.from(new Set([...Mandarin, ...Cantonese])).map((e) => parseInt(e.slice(2), 16));
Japanese.sort((a, b) => a - b);
Chinese.sort((a, b) => a - b);

console.log("---------- Extracted Logs (No duplicate) ----------");
console.log();
console.log("Japanese characters:", Japanese.length);
console.log("Chinese  characters:", Chinese.length);
console.log();
console.log("---------------------------------------------------");

function toCodeString(input: number): string {
    const str = input.toString(16);
    return str.length > 4 ? `\\u{${str}}` : `\\u${str}`;
}

function buildCode([latestBuiltCode, previousBuiltCode, previousCode]: [string, number, number]): string {
    return previousBuiltCode === previousCode
        ? latestBuiltCode + toCodeString(previousBuiltCode)
        : latestBuiltCode +
              toCodeString(previousBuiltCode) +
              (previousCode - previousBuiltCode === 1 ? "" : "-") +
              toCodeString(previousCode);
}

function generateRegExpSource(arr: number[]): string {
    const sum = arr.reduce(
        (previousBuiltCode: [string, number, number], currentCode: number): [string, number, number] => {
            if (previousBuiltCode[1] < 0) return [previousBuiltCode[0], currentCode, currentCode];
            if (currentCode - previousBuiltCode[2] === 1) return [previousBuiltCode[0], previousBuiltCode[1], currentCode];

            return [buildCode(previousBuiltCode), currentCode, currentCode];
        },
        ["", -1, -1]
    );
    if (sum[1] === -1) return "";
    return buildCode(sum);
}

execSync("mkdir -p " + distributedCodesDirectory);

fs.writeFileSync(JapaneseCodesEntryPoint, generateRegExpSource(Japanese));
fs.writeFileSync(ChineseCodesEntryPoint, generateRegExpSource(Chinese));

console.log();
console.log("Done");
