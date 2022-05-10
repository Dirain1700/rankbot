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
    let command;
    if (format?.includes("1v1")) command = `/tour new ${format}, rr`;
    else command = `/tour new ${format}, elim`;
    client.sendRoom(room, command);
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
    const format = tourSchedule[new Date().getDate()];
    client.sendRoom(room, `/announce 30分後から${format}のOfficial Tournamentを開催します!奮ってご参加ください!`);
    client.sendRoom(room, `/announce After 30 minutes , we will open an Official Tournament in ${format}! Please join with us!`);
    const randomized = ["Random", "Factory", "Hackmons", "Staff"];
    if (!randomized.some((e) => format.includes(e))) client.sendRoom(room, `!tier ${format}`);
};
