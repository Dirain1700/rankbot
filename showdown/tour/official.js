"use strict";

const forEachSend = (array, func, time) => {
    let send;
    let i = 0;
    send = setInterval(async () => {
        array.slice(i, i + 5)?.forEach((e) => func(e));
        if (i >= array.length) clearInterval(send);
        else i += 5;
    }, time);
};

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
    const { format, name, rules } = tourSchedule[new Date().getDate()];
    if (!format) return void client.sendRoom(room, "Data not found.");
    const command = [];
    if (format.includes("1v1")) command.push(`/tour new ${format}, rr`);
    else command.push(`/tour new ${format}, elim`);

    if (rules) rules.map((e) => "/tour rules " + e).forEach(command.push);
    if (name) command.push(name);

    if (command.length > 5) forEachSend(command, client.send, client.messageInterval);
    else command.forEach((e) => client.sendRoom(room, e));
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
    const { format, name, rules } = tourSchedule[new Date().getDate()];
    client.sendRoom(room, `/announce 30分後から${name ?? format}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    client.sendRoom(room, `/announce After 30 minutes , we will open an Official Tournament in ${name ?? format}! Please join with us!`);
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) client.sendRoom(room, `!tier ${format}`);
    if (rules) {
        if (rules.length > 5)
            forEachSend(rules.map((e) => `${room}|!tier ${e}`), client.send, client.messageInterval);
        else rules.forEach((e) => client.sendRoom(room, e));
    }
};
