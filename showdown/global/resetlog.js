module.exports = message => {
  if (message.type === "chat" && message.target.roomid.includes("japanese")) return;
  message.reply("ログの削除が完了しました。");
  const file = path.resolve(__dirname, "./../../config/log/chatlog.json");
  setTimeout(() => {
    fs.writeFileSync(file, "[]");
  }, 500);
};
