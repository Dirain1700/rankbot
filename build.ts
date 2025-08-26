"use strict";

import * as path from "node:path";

import { buildSync } from "esbuild";
import { globSync } from "glob";
import { cloneDeep, merge } from "lodash";

const mainTargetFiles = globSync(["src/**/*.ts", "data/**/*.ts", "config/**/*.ts"])
    .filter((f) => !f.endsWith("-source.ts"))
    .map((e) => path.resolve(__dirname, e));
const utilityFiles = ["build.ts", "tsc.ts"].map((e) => path.resolve(__dirname, e));
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

export function build() {
    console.log("Transpiling utility files...");

    // @ts-expect-error format should be assignable
    // prettier-ignore
    buildSync(merge(cloneDeep(config), {
        entryPoints: utilityFiles,
        format: "cjs",
        outdir: path.resolve(__dirname, "./"),
        tsconfig: path.resolve(__dirname, "tsconfig.build.json")
    }));

    // @ts-expect-error format should be assignable
    // prettier-ignore
    buildSync(merge(cloneDeep(config), {
        entryPoints: mainTargetFiles,
        outdir: distDir,
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
    }));

    console.log(new Date().toLocaleString("ja-jp", { timeZone: "Asia/Tokyo" }), "Sucessfully built files!");
    console.log();
}

build();
