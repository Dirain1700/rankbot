"use strict";

const axios = require("axios");
const fs = require("fs");
const { format } = require("prettier");
const { execSync } = require("child_process");
const JSFilePath = "./data/dex/pokedex.js";
const JSONFilePath = "./data/dex/pokedex.json";

const url = "https://raw.githubusercontent.com/smogon/pokemon-showdown/c1faaa40133755be8b4bfff195a2cec5a1012163/data/pokedex.ts";
(async () => {
    const raw = await axios
        .get(url)
        .then((res) => {
            return res.data.replace("export const Pokedex: {[speciesid: string]: SpeciesData} =", "module.exports =");
        })
        .catch(console.error);

    if (!raw) return console.log("Missing string");
    fs.writeFileSync(JSFilePath, raw);
    const rawJS = require(JSFilePath);
    const Dex = {};

    for (const mon of Object.keys(rawJS)) {
        if (rawJS[mon].num <= 0) break;
        Dex[mon] = rawJS[mon];
    }

    const strData = format(JSON.stringify(Dex, null, 4), { parser: "json", tabWidth: 4 });

    fs.writeFileSync(JSONFilePath, strData);
    execSync(`rm ${JSFilePath}`);
    console.log(Dex);
})();
