exports.createTour = (message) => {
    let run;
    const option = message.content.toLowerCase().split(" ");
    switch (option[1]) {
        case "random":
            run = require("./random");
            break;
        default:
            run = require("./tours");
            break;
    }
    run(message, option);
};

exports.setTourSettings = async (client, room, msg, isIntro) => {
    const sleep = (t) => new Promise((r) => setTimeout(r, t));
    if (isIntro || !room.includes("japanese")) return;
    const event = msg.split("|")[0];
    if (event === "create") {
        if (config.tourSettings.length > 5) {
            let send;
            let i = 0;
            send = setInterval(async () => {
                await sleep(client.sendInterval);
                config.tourSettings.slice(i, i + 5)?.forEach((e) => client.send(`${room}|/tour ${e}`));
                if (i >= config.tourSettings.length) clearInterval(send);
                else i += 5;
            }, client.sendInterval + 50);
        } else {
            await sleep(client.sendInterval);
            config.tourSettings?.forEach((e) => client.sendRoom(room, `/tour ${e}`));
        }
        const format = msg.split("|")[1];
        const randomized = ["random", "factory", "hackmons", "staff"];
        if (!randomized.some((e) => format.includes(e))) {
            await sleep(client.sendInterval);
            client.sendRoom(room, "/tour scouting disallow");
        }
    }
    /*
		if (event === "end")
			client.send("japanese|!code " + msg.split("|").slice(1).join("|"));
	*/
};
