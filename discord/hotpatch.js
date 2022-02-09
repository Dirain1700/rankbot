module.exports = fileName => {
  const toFilePath = () => {
    let filePath;
    switch (arg) {
      case "ranksort": case "sort": 
        filePath = "./ranksort";
        fileName = "ranksort"
        break;
      case "ping":
        filePath = "./interaction/ping";
        break;
      case "ban":
        filePath = "./interaction/mod/ban";
        break;
      case "forceban": case "fban":
        filePath = "./interaction/mod/forceban";
        fileName = "forceban"
        break;
      case "unban": 
        filePath = "./interaction/mod/unban";
        break;
      case "cleartext": case "hidetext": case "ct": case "clear": case "hide":
        filePath = "./interaction/mod/cleartext";
        fileName = "cleartext"
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
        filePath = "./interaction/points/rank;
        break;
      case "clearleaderboard": case "clearboard": case "resetleaderboards": case "resetboard":
        filePath = "./interaction/points/clearboard";
        fileName = "clearleaderboard";
        break;
      case "runjs": case "vm2":
        filePath = "./message/runjs";
        fileName = "runjs"
        break;
      case "sendlog": case "log":
        filePath = "./../showdown/chat/sendlog";
        fileName = "sendlog";
        break;
      default: return "Invalid argument.";
    };
    return {
      "path": filePath,
      "name": fileName
    };
  };
      
        
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
  };
};
