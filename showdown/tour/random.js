module.exports = (message) => {
    const { formatNameList } = require("./formatnames");
    const choice = Math.floor(Math.random() * formatNameList.length);
    const result = formatNameList[choice];

    if (result === "[Gen 8] Battle Stadium Singles Series 9") {
        const cmd = ["/tour new bss, elim", "/tour rules -Restricted Legendary, vgctimer", "/tour name [Gen 8] Battle Stadium Singles S9"];
        message.reply(cmd.join("\n"));
        return;
    }

    message.reply(`/tour new ${result}, elim`);
    message.target.send(`/adduhtml pickedtour, <div class="infobox"><em>We randomly picked:</em> ${result}</div>`);
    if (result === "[Gen 8] Battle Stadium Singles") {
        const cmd = ["/tour rules VGC Timer", "/tour name [Gen 8] Battle Stadium Singles"];
        message.reply(cmd.join("\n"));
    }
};
