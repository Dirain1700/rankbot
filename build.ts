"use strict";

import * as fs from "node:fs";
import * as path from "node:path";

import { buildSync } from "esbuild";
import { globSync } from "glob";
import { cloneDeep, merge } from "lodash";

const mainTargetFiles = globSync(["src/**/*.ts", "data/**/*.ts", "config/**/*.ts"])
    .filter((f) => !f.endsWith("-source.ts"))
    .map((e) => path.resolve(__dirname, e));
const utilityFiles = ["build.ts", "tsc.ts"].map((e) => path.resolve(__dirname, e));
const setupFiles = globSync(["setup/**/*.ts"]).map((e) => path.resolve(__dirname, e));
const detectZhDir = path.resolve(__dirname, "src/detect-zh");
const unihanDataFiles = globSync(["data/Unihan/result/*.txt"]);
const mainUnihanSourceFileName = path.join(detectZhDir, "src/detect-source.ts");
const mainUnihanFileName = path.join(detectZhDir, "src/detect.ts");
const exportUnihanSourceFileName = path.join(detectZhDir, "src/index-source.ts");
const exportUnihanFileName = path.join(detectZhDir, "src/index.ts");
const distDir = path.resolve(__dirname, "dist");

const config = {
    allowOverwrite: true,
    format: "cjs",
    platform: "node",
    target: "esnext",
    sourcemap: true,
    sourcesContent: false,
    write: true,
};

console.log("Transpiling utility files...");

// @ts-expect-error format should be assignable
// prettier-ignore
buildSync(merge(cloneDeep(config), {
    entryPoints: utilityFiles,
    format: "cjs",
    outdir: path.resolve(__dirname, "./"),
    tsconfig: path.resolve(__dirname, "tsconfig.build.json"),
}));

console.log("Transpiling Unihan database setup files...");

if (fs.existsSync(distDir)) {
    const stats = fs.readdirSync(distDir, { withFileTypes: true });

    for (const stat of stats) {
        if (!stat.isFile()) fs.rmSync(path.join(distDir, stat.name), { recursive: true });
    }
} else {
    fs.mkdirSync(distDir, { recursive: true });
}

// @ts-expect-error format should be assignable
// prettier-ignore
buildSync(merge(cloneDeep(config), {
    entryPoints: setupFiles,
    format: "cjs",
    outdir: path.resolve(__dirname, "dist/setup"),
    tsconfig: path.join(detectZhDir, "tsconfig.setup.json"),
}));

if (unihanDataFiles.length === 2) {
    console.log("Generating Unihan database from extracted RegExp...");

    let jaUnicodes: string = "";
    let zhUnicodes: string = "";

    for (const dataFileName of unihanDataFiles) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dataFile = fs.readFileSync(dataFileName, "utf-8").trim().split("\n")[0]!;

        if (dataFileName.endsWith("chinese.txt")) zhUnicodes = dataFile;
        else if (dataFileName.endsWith("japanese.txt")) jaUnicodes = dataFile;
        else throw new Error("Unknown unicodes detected");
    }

    if (!zhUnicodes || !jaUnicodes) throw new Error("Empty Unicodes detected");

    const mainUnihanFileSource = fs
        .readFileSync(mainUnihanSourceFileName, "utf-8")
        .replaceAll("{ZH_REGEXP}", zhUnicodes)
        .replaceAll("{JA_REGEXP}", jaUnicodes);

    fs.writeFileSync(mainUnihanFileName, mainUnihanFileSource);

    mainTargetFiles.push(mainUnihanFileName);

    const exportUnihanFileSource = fs.readFileSync(exportUnihanSourceFileName, "utf-8").replaceAll("-source", "");

    fs.writeFileSync(exportUnihanFileName, exportUnihanFileSource);

    mainTargetFiles.push(exportUnihanFileName);
}

// @ts-expect-error format should be assignable
// prettier-ignore
buildSync(merge(cloneDeep(config), {
    entryPoints: mainTargetFiles,
    outdir: distDir,
    tsconfig: path.resolve(__dirname, "tsconfig.json"),
}));

if (unihanDataFiles.length === 2) {
    fs.unlinkSync(mainUnihanFileName);
    fs.unlinkSync(exportUnihanFileName);
}

console.log("Sucessfully built files!");
console.log();
