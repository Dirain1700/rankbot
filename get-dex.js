"use strict";

const axios = require("axios");
const fs = require("fs");
const { format } = require("prettier");
const { execSync } = require("child_process");
const DexFilePath = "./data/dex/pokedex.js";
const TierFilePath = "./data/dex/tier.js";
const JSONFilePath = "./data/dex/pokedex.ts";

const dex_url = "https://raw.githubusercontent.com/smogon/pokemon-showdown/c1faaa40133755be8b4bfff195a2cec5a1012163/data/pokedex.ts";
const tier_url = "https://raw.githubusercontent.com/smogon/pokemon-showdown/c3b022d021eefb0a7048e545d37257b459228d41/data/formats-data.ts";

(async () => {
    const raw_dex = await axios
        .get(dex_url)
        .then((res) => {
            return res.data.replace("export const Pokedex: {[speciesid: string]: SpeciesData}", "module.exports");
        })
        .catch(console.error);
    const raw_tier = await axios.get(tier_url).then((res) => {
        return res.data
            .replace("export const FormatsData: {[k: string]: SpeciesFormatsData}", "module.exports")
            .replaceAll("(", "")
            .replaceAll(")", "")
            .replaceAll("DUU", "Doubles UU")
            .replaceAll("DOU", "Doubles OU")
            .replaceAll("DUber", "Doubles Uber")
            .replaceAll("Uber", "Ubers")
            .replaceAll("AG", "Anything Goes");
    });

    if (!raw_dex || !raw_tier) return console.log("Missing string");
    fs.writeFileSync(DexFilePath, raw_dex);
    fs.writeFileSync(TierFilePath, raw_tier);
    const rawDex = require(DexFilePath);
    const rawTier = require(TierFilePath);
    const Dex = {};

    for (const mon of Object.keys(rawDex)) {
        if (rawDex[mon].num <= 0) continue;
        Dex[mon] = rawDex[mon];
    }

    for (const mon of Object.keys(rawTier)) {
        if (!Dex[mon]) continue;
        for (const k of Object.keys(rawTier[mon])) {
            if (!k.startsWith("random")) continue;
            delete rawTier[mon][k];
        }
        Object.assign(Dex[mon], rawTier[mon]);
    }

    let str = '"use strict";import type { Species } from "../../types/dex";export const dex: { [id: string]: Species } =';
    str += JSON.stringify(Dex, null, 4);
    const strData = format(str, { parser: "typescript", tabWidth: 4 });

    fs.writeFileSync(JSONFilePath, strData);
    execSync(`rm ${DexFilePath}`);
    execSync(`rm ${TierFilePath}`);
    console.log("Done");
})();
