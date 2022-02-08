module.exports = message => {
  if (message.content.startsWith(".echo")) {
   return message.reply(message.content.replace(".echo ", ""));
  }else if (message.content === ".resetlog" && message.target.roomid === "japanese") {
    message.reply("ログの削除が完了しました。");
    const file = path.resolve(__dirname, "./../config/log/chatlog.json");
    setTimeout(() => {
      fs.writeFileSync(file, "[]");
    }, 500);
  }else if (message.content.startsWith("process.exit")) {
    process.exit(0);
  }
};
