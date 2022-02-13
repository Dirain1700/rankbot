module.exports = message => {
  const { formatNameList } = require("./formatnames");
  const choice = Math.floor(Math.random() * formatNameList.length);
  const result = formatNameList[choice];

  if (result === "[Gen 8] Battle Stadium Singles Series 9") {
    message.reply("/tour new bss");
    message.reply("/tour rules -Restricted Legendary, vgctimer");
    message.reply("/tour name [Gen 8] Battle Stadium Singles S9")
    return;
  }
  
  message.reply(`/tour new ${result}, elim`);
  if (result === "[Gen 8] Battle Stadium Singles") {
    message.reply("/tour rules vgctimer");
    message.reply("/tour name [Gen 8] Battle Stadium Singles")
  }
};
