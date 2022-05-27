"use strict";

exports.createTour = (client, room) => {
    let month = new String(new Date().getMonth() + 1);
    month = month.length === 1 ? "0" + month : month;
    let tourSchedule;
    try {
        tourSchedule = require(`./schedule/${new Date().getFullYear()}${month}.json`);
    } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") client.sendRoom(room, "!code " + e);
        return;
    }
    const format = tourSchedule[new Date().getDate()];
    if (!format) return void client.sendRoom(room, "Data not found.");
    const command = [];
    if (format.format.includes("1v1")) command.push(`/tour new ${format.format}, rr`);
    else command.push(`/tour new ${format.format}, elim`);

    if (format.rules) format.rules.map((e) => "/tour rules " + e).forEach(command.push);
    if (format.name) command.push(format.name);

    if (command.length > 5) {
            let send;
            let i = 0;
            send = setInterval(async () => {
                command.slice(i, i + 5)?.forEach((e) => client.send(`${room}|/tour ${e}`));
                if (i >= command.length) clearInterval(send);
                else i += 5;
            }, client.sendInterval + 50);
        } else {
            command.forEach((e) => client.sendRoom(room, e));
        }
};

exports.announce = (client, room) => {
    let month = new String(new Date().getMonth() + 1);
    month = month.length === 1 ? "0" + month : month;
    let tourSchedule;
    try {
        tourSchedule = require(`./schedule/${new Date().getFullYear()}${month}.json`);
    } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") client.sendRoom(room, "!code " + e);
        return;
    }
    const { format, name } = tourSchedule[new Date().getDate()];
    client.sendRoom(room, `/announce 30分後から${name}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    client.sendRoom(room, `/announce After 30 minutes , we will open an Official Tournament in ${name}! Please join with us!`);
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) client.sendRoom(room, `!tier ${format}`);
};
