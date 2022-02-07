module.exports = message => {
  if (message.content.startsWith(".echo")) {
   return message.reply(message.content.replace(".echo ", ""));
  }else if (message.content === ".resetlog" && message.target.roomid === "japanese") {
    message.reply(`japanese|ログの削除が完了しました。`);
    setTimeout(() => {
      fs.writeFileSync("./config/log/chatlog.json", "[]");
    }, 500);
  }else if (message.content.startsWith("process.exit")) {
    process.exit(0);
  }
};
