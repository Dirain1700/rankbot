exports.getRelative = (message) => {
    if (message.author?.userid !== config.owner) return void message.reply("Access denied.");
    require("./../hotpatch")(path.relative(__dirname, message.content.substring(15)), message);
};

exports.getFile = (message) => {
    if (message.author?.userid !== config.owner) return void message.reply("Access denied.");
    const fileName = message.content
        .split(" ")[1]
        .toLowerCase()
        .replace(/[^a-z]/g, "");
    if (!fileName) return;
    if (fileName === "git") {
        const { exec } = require("child_process");
        exec("git pull", { stdio: "inherit" }, async (error, stdout, stderr) => {
            let result = "";
            if (error) result += error + "\n";
            if (stdout === "Already up-to-date.") {
                return void message.reply("``" + stdout + "``").catch();
            } else {
                result += stdout;
                result += stderr;
            }
            if (result) message.reply("!code " + result).catch();
        });
        return;
    } else {
        const toFile = () => {
            let filePath;
            try {
                switch (fileName) {
                    case "runjs":
                    case "vm2":
                        filePath = "./chat/runjs";
                        break;
                    case "ping":
                        filePath = "./chat/sendlog";
                        break;
                    case "invite":
                        filePath = "./pm/invite";
                        break;
                    case "resetlog":
                        filePath = "./global/resetlog";
                        break;
                    case "tour":
                        filePath = "./tour/tourmanager";
                        break;
                    case "message":
                    case "structures":
                        filePath = "./structures";
                        break;
                    case "index":
                    case "showdown":
                    case "self":
                        filePath = "./index";
                        break;
                    case "discord":
                        filePath = "./../discord/index";
                        break;
                    case "output":
                    case "export":
                        filePath = "./global/output";
                        break;
                    case "raw":
                        filePath = "./chat/raw";
                        break;
                    case "tourmanager":
                        filePath = "./tour/tourmanager";
                        break;
                    case "official":
                        filePath = "./tour/official";
                        break;
                    default:
                        throw `TypeError: Invalid argument "${fileName}"`;
                }
            } catch (e) {
                return void message.reply("``" + e + "``");
            }
            return filePath;
        };
        if (!toFile(fileName)) return;
        require("./../hotpatch")(path.resolve(__dirname, toFile(fileName)), message);
    }
};
