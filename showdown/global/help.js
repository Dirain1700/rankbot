module.exports = (message) => {
    require("../structures");

    if (message.type === "chat") {
        if (!message.author.isRoomVoice() || !["+", "%", "@", "&"].includes(message.author.group)) return;
    }

    const lang = message.content.toLowerCase().substring(6)?.trim() ?? "japanese";

    let url;
    switch (lang) {
        case "japanese":
        case "jp":
            url = "README";
            break;
        case "english":
        case "en":
            url = "README-en";
            break;
        default:
            return void message.reply("That language does not exist!");
    }
    if (!url) return;
    message.reply(`Dirain1700's Guide: https://github.com/Dirain1700/rankbot/blob/main/${url}.md`);
};
