module.exports = message => {
  const { formatNameList } = require("./formatnames");
  const choice = Math.floor(Math.random() * formatNameList.length);
  const result = formatNameList[choice];

  if (result === "[Gen 8] Battle Stadium Singles Series 9") {
    const cmd = [
      "/tour new bss",
      "/tour rules -Restricted Legendary, vgctimer",
      "/tour name [Gen 8] Battle Stadium Singles S9"
      ];
    message.reply(cmd.join("\n"));
    return;
  }
  
  message.reply(`/tour new ${result}, elim`);
  if (result === "[Gen 8] Battle Stadium Singles") {
    const cmd = [
      "/tour rules vgctimer",
      "/tour name [Gen 8] Battle Stadium Singles"
      ];
    message.reply(cmd.join("\n"));
  }
};
