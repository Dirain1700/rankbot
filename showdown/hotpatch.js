/** @type {string} fileName */
module.exports = async (fileName, message) => {
  const toFile = () => {
    let filePath;
    try{
      switch (fileName) {
        case "runjs": case "vm2": 
          filePath = "./chat/runjs";
          break;
        case "ping":
          filePath = "./chat/sendlog";
          break;
        case "invite":
          filePath = "./pm/invite";
          break;
        case "resetlog":
          filePath = "./global/resetlog";
          break;
        case "message": case "structures":
          filePath = "./structures";
          break;
        case "index": case "showdown": case "self":
          filePath = "./index";
          break;
        case "discord":
          filePath = "./../discord/index.js";
          break;
        default:  throw (`TypeError: Invalid argument "${fileName}"`);
      }
    }catch(e){
      return message.reply("``" + e + "``");
    }
    return filePath;
  };

  if (!toFile(fileName)) return;
  
  const run = async () => {
    const sleep = t => new Promise((r) => setTimeout(r, t));
    delete require.cache[require.resolve(toFile(fileName))];
    await sleep(1000);
    message.reply("Hotpatch successed: ``"+ toFile(fileName) + ".js``");
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
