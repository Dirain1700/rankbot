/** @type {string} fileName */
module.exports = async (fileName, interaction) => {
  const toFile = () => {
    new Promise((resolve, reject) => {
      let filePath;
      switch (fileName) {
        case "ranksort": case "sort": 
          filePath = "./ranksort";
          resolve();
          break;
        case "ping":
          filePath = "./interaction/ping";
          resolve();
          break;
        case "ban":
          filePath = "./interaction/mod/ban";
          resolve();
          break;
        case "forceban": case "fban":
          filePath = "./interaction/mod/forceban";
          resolve();
          break;
        case "unban": 
          filePath = "./interaction/mod/unban";
          resolve();
          break;
        case "cleartext": case "hidetext": case "ct": case "clear": case "hide":
          filePath = "./interaction/mod/cleartext";
          resolve();
          break;
        case "forcecleartext": case "fct": case "forceclear": case "forcetext":
          filePath = "./interaction/mod/forcecleartext";
          resolve();
          break;
        case "kick":
          filePath = "./interaction/mod/kick";
          resolve();
          break;
        case "mute":
          filePath = "./interaction/mod/mute";
          resolve();
          break;
        case "unmute":
          filePath = "./interaction/mod/unmute";
          resolve();
          break;
        case "apt":
          filePath = "./interaction/points/apt";
          resolve();
          break;
        case "rpt":
          filePath = "./interaction/points/rpt";
          resolve();
          break;
        case "rank":
          filePath = "./interaction/points/rank";
          resolve();
          break;
        case "clearleaderboard": case "clearboard": case "resetleaderboards": case "resetboard":
          filePath = "./interaction/points/clearboard";
          resolve();
          break;
        case "runjs": case "vm2":
          filePath = "./message/runjs";
          resolve();
          break;
        case "sendlog": case "log":
          filePath = "./../showdown/chat/sendlog";
          resolve();
          break;
        case "showdown":
          filePath = "./../showdown/index";
          resolve();
          break;
        case "index": case "discord": case "self":
          filePath = "./index";
          resolve();
          break;
        default:  return reject(`TypeError: Invalid argument "${fileName}"`);
      }
      return filePath;
    }).catch(e => { 
      return interaction.reply(e);
    });
  };

  if (!toFile(fileName)) return;

  await interaction.deferReply({ ephemeral: false });
  const run = async () => {
    const sleep = t => new Promise((r) => setTimeout(r, t));
    delete require.cache[require.resolve(toFile(fileName))];
    await sleep(1000);
    interaction.followUp(`Hotpatch successed: ${toFile(fileName)}.js`);
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
