/* global message: false*/
exports.logmsg = function(ch, user){
  const day = new Date().toLocaleString("ja-jp", { timeZone: "Asia/Tokyo" });
  const datename = (day.split(" ")[0]).replaceAll("/", "-");
  const min = day.split(" ")[1];
    if (isExists(`./config/log/${ch}/${datename}.txt`) == true) {
      fs.appendFileSync(`./config/log/${ch}/${datename}.txt`, `\n[${min}] ${user}: ${message}`);
    }else{
      fs.writeFileSync(`./config/log/${ch}/${datename}.txt`, `[${min}] ${user}: ${message}`);
    }
  
  function isExists(file) {
    try {
      fs.statSync(file);
      return true;
    } catch(err) {
      if(err.code === "ENOENT") return false;
    }
  }
};