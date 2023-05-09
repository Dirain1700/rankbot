"use strict";

import type { Snowflake } from "discord.js";

export interface PointsDB {
    [key: Snowflake]: { points: number };
}

export default () => {
    const file = path.resolve(__dirname, "./config/rank.json");
    const db: PointsDB = JSON.parse(fs.readFileSync(file, "utf-8")) as PointsDB;
    const obj = Object.entries(db);
    obj.sort((a, b) => b[1].points - a[1].points);
    const edit = JSON.stringify(Object.fromEntries(obj), null, 4);
    fs.writeFileSync(file, edit);
};
