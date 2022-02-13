module.exports = message => {
  const { formatNameList } = require("./formatnames");
  const choice = Math.floor(Math.random() * formatNameList.length);
  const result = formatNameList[choice];
  
  message.reply(`/tour new ${result}`);
};
