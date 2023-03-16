"use strict";

import * as path from "node:path";

import { build } from "esbuild";
import { globSync } from "glob";

const targetFiles = globSync(["src/**/*.ts", "data/**/*.ts", "config/**/*.ts"]);
const tsconfig = path.resolve(__dirname, "tsconfig.json");

const config = {
    allowOverwrite: true,
    entryPoints: targetFiles,
    format: "cjs",
    outdir: "dist",
    platform: "node",
    target: "esnext",
    tsconfig,
    sourcemap: true,
    sourcesContent: false,
    write: true,
};

console.log("Running CommonJS esbuild...");

// @ts-expect-error format should be assignable
build(config)
    .then(() => console.log("Sucessfully built files!"))
    .catch((e) => {
        console.log("Failed to build files.");
        console.error(e);
    });
