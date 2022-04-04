/** @type {string} filePath */
module.exports = async (filePath, message) => {
  if (!filePath || !isExist(filePath))
		message.reply("!code " + new Error(`Module not found: ${filePath} `));
  
  const run = async () => {
    await delete require.cache[require.resolve(filePath)];
    message.reply("Hotpatch successed: ``"+ filePath + ".js``");
  };
  run();
  
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
