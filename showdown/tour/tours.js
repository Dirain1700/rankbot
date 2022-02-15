module.exports = (message, option) => {
  if (option === "bsss9"); {
    const commands = [
      "/tour new bss",
      "/tour rules -Restricted Legendary, vgctimer",
      "/tour name [Gen 8] Battle Stadium Singles S9"
    ];
    message.reply(commands.join("\n"));
    return;
  }
};
