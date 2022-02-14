/** @type {string} fileName */
module.exports = async (fileName, interaction) => {
  const { inlineCode } = require("@discordjs/builders");
  const toFile = () => {
    let filePath;
    try{
      switch (fileName) {
        case "ranksort": case "sort": 
          filePath = "./ranksort";
          break;
        case "ping":
          filePath = "./interaction/ping";
          break;
        case "ban":
          filePath = "./interaction/mod/ban";
          break;
        case "forceban": case "fban":
          filePath = "./interaction/mod/forceban";
          break;
        case "unban": 
          filePath = "./interaction/mod/unban";
          break;
        case "cleartext": case "hidetext": case "ct": case "clear": case "hide":
          filePath = "./interaction/mod/cleartext";
          break;
        case "forcecleartext": case "fct": case "forceclear": case "forcetext":
          filePath = "./interaction/mod/forcecleartext";
          break;
        case "kick":
          filePath = "./interaction/mod/kick";
          break;
        case "mute":
          filePath = "./interaction/mod/mute";
          break;
        case "unmute":
          filePath = "./interaction/mod/unmute";
          break;
        case "apt":
          filePath = "./interaction/points/apt";
          break;
        case "rpt":
          filePath = "./interaction/points/rpt";
          break;
        case "rank":
          filePath = "./interaction/points/rank";
          break;
        case "clearleaderboard": case "clearboard": case "resetleaderboards": case "resetboard":
          filePath = "./interaction/points/clearboard";
          break;
        case "runjs": case "vm2":
          filePath = "./message/runjs";
          break;
        case "sendlog": case "log":
          filePath = "./../showdown/chat/sendlog";
          break;
        case "showdown":
          filePath = "./../showdown/index";
          break;
        case "index": case "discord": case "self":
          filePath = "./index";
          break;
        default: throw (`TypeError: Invalid argument "${fileName}"`);
      }
    }catch(e){
      interaction.reply(e);
    }
    return filePath;
  };
  const filePath = toFile(fileName);
  
  if(!filePath || !isExist(filePath)) return;

  await interaction.deferReply({ ephemeral: false });
  const run = async () => {
    const sleep = t => new Promise((r) => setTimeout(r, t));
    await delete require.cache[require.resolve(filePath)];
    await sleep(1000);
    interaction.followUp(`Hotpatch successed: ${inlineCode(filePath + ".js")}`);
  };
  await run();
  
  /** @type {string} filePath */
  function isExist(filePath){
    try {
      require(filePath);
      return true;
    }catch(e){
      if (e.code === "MODULE_NOT_FOUND")
      return false;
      else return;
    }
  }
};
