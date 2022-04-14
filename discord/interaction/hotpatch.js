exports.getRelative = (interaction) => {
    if (!config.admin.includes(interaction.user.id)) return void interaction.reply({ content: "Access denied.", ephemeral: true });
    require("./../hotpatch")(path.relative(__dirname, interaction.options.getString("module", true)), interaction);
};

exports.getFile = (interaction) => {
    if (config.admin.includes(interaction.user.id)) return void interaction.reply({ content: "Access denied.", ephemeral: true });
    const fileName = interaction.options.getString("module");
    if (fileName === "git") {
        interaction.deferReply();
        const { codeBlock, inlineCode } = require("@discordjs/builders");
        const { exec } = require("child_process");
        exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
            if (error) {
                interaction.followUp(inlineCode(error));
                return;
            }
            if (stdout === "Already up-to-date.") {
                return interaction.followUp(inlineCode(stdout));
            } else interaction.followUp(codeBlock("diff", stderr + stdout));
        });
        return;
    }
    const toFile = () => {
        let filePath;
        try {
            switch (fileName) {
                case "ranksort":
                case "sort":
                    filePath = "./ranksort";
                    break;
                case "ping":
                    filePath = "./interaction/ping";
                    break;
                case "ban":
                    filePath = "./interaction/mod/ban";
                    break;
                case "forceban":
                case "fban":
                    filePath = "./interaction/mod/forceban";
                    break;
                case "unban":
                    filePath = "./interaction/mod/unban";
                    break;
                case "cleartext":
                case "hidetext":
                case "ct":
                case "clear":
                case "hide":
                    filePath = "./interaction/mod/cleartext";
                    break;
                case "forcecleartext":
                case "fct":
                case "forceclear":
                case "forcetext":
                    filePath = "./interaction/mod/forcecleartext";
                    break;
                case "kick":
                    filePath = "./interaction/mod/kick";
                    break;
                case "mute":
                    filePath = "./interaction/mod/mute";
                    break;
                case "unmute":
                    filePath = "./interaction/mod/unmute";
                    break;
                case "apt":
                    filePath = "./interaction/points/apt";
                    break;
                case "rpt":
                    filePath = "./interaction/points/rpt";
                    break;
                case "rank":
                    filePath = "./interaction/points/rank";
                    break;
                case "clearleaderboard":
                case "clearboard":
                case "resetleaderboards":
                case "resetboard":
                    filePath = "./interaction/points/clearboard";
                    break;
                case "runjs":
                case "vm2":
                    filePath = "./message/runjs";
                    break;
                case "sendlog":
                case "log":
                    filePath = "./../showdown/chat/sendlog";
                    break;
                case "showdown":
                    filePath = "./../showdown/index";
                    break;
                case "index":
                case "discord":
                case "self":
                    filePath = "./index";
                    break;
                default:
                    throw `TypeError: Invalid argument "${fileName}"`;
            }
        } catch (e) {
            interaction.reply(e);
        }
        return filePath;
    };
    require("./../hotpatch")(toFile(fileName), interaction);
};
