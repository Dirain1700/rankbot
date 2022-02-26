const { Message } = require("ps-client").classes;

Message.prototype.getRoomAuth = function() {
    const user = this.raw.split("|")[3];
    const regex  = /a-zA-Z0-9/;
    return regex.test(user.charAt(0)) ? " " : user.charAt(0);
};

Message.prototype.isStaff = function() {
  
  const driver = this.target.auth["%"].includes(this.author.userid);
  const mod = this.target.auth["@"].includes(this.author.userid);
  const owner = this.target.auth["#"].includes(this.author.userid);
  return ([driver, mod, owner].includes(true) || ["%", "@", "&"].includes(this.author.group)) ? true : false;
};