const { Message } = require("ps-client").classes;

Message.prototype.getRoomAuth = function(){
    const user = this.raw.split("|")[3];
    const regex = /a-zA-Z0-9/;
    return regex.test(user.charAt(0)) ? " " : user.charAt(0);
};