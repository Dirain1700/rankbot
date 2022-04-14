module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("ウマ娘 プリティーダービー Season2", { type: "WATCHING" }, { status: "busy" });
    //eslint-disable-next-line no-unused-vars
    const cmd = require("./../config/command.js");
};
