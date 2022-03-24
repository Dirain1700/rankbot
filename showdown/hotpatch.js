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
        case "tour":
          filePath = "./tour/tourmanager";
          break;
        case "message": case "structures":
          filePath = "./structures";
          break;
        case "index": case "showdown": case "self":
          filePath = "./index";
          break;
        case "discord":
          filePath = "./../discord/index";
          break;
        case "output":
          filePath = "./global/output";
          break;
				case "raw": 
					filePath = "./chat/raw";
					break;
        default: throw (`TypeError: Invalid argument "${fileName}"`);
      }
    }catch(e){
      return message.reply("``" + e + "``");
    }
    return filePath;
  };
  const filePath = toFile(fileName);
  
  if (!filePath || !isExist(filePath)) return;
  
  const run = async () => {
    delete require.cache[require.resolve(filePath)];
    message.reply("Hotpatch successed: ``"+ filePath + ".js``");
  };
  await run();
  
  /*
   * @param {string} filePath
   * @returns {boolean} 
   */
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
