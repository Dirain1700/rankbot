/** @type {string} fileName */
module.exports = async (fileName, message) => {
  const toFile = () => {
    new Promise((resolve, reject) => {
      let filePath;
      switch (fileName) {
        case "runjs": case "vm2": 
          filePath = "./chat/runjs";
          resolve();
          break;
        case "ping":
          filePath = "./chat/sendlog";
          resolve();
          break;
        case "invite":
          filePath = "./pm/invite";
          resolve();
          break;
        case "commands":
          filePath = "./commands";
          resolve();
          break;
        case "message": case "structures":
          filePath = "./structures";
          resolve();
          break;
        case "index": case "showdown": case "self":
          filePath = "./index";
          resolve();
          break;
        case "discord":
          filePath = "./../discord/index.js";
          resolve();
          break;
        default:  return reject(`TypeError: Invalid argument "${fileName}"`);
      }
      return filePath;
    }).catch(e => { 
      return message.reply(e);
    });
  };

  if (!toFile(fileName)) return;
  
  const run = async () => {
    const sleep = t => new Promise((r) => setTimeout(r, t));
    delete require.cache[require.resolve(toFile(fileName))];
    await sleep(1000);
    message.reply(`Hotpatch successed: ${toFile(fileName)}.js`);
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
