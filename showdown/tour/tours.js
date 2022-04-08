module.exports = (message, option) => {
    let commands;
    switch (option[1]) {
        case "bsss9":
            commands = ["/tour new bss, elim", "/tour rules -Restricted Legendary, VGC Timer", "/tour name [Gen 8] Battle Stadium Singles S9"];
            break;
        default:
            commands = ["Invalid option."];
    }
    message.reply(commands.join("\n"));
    return;
};
