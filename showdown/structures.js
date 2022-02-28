const { Message } = require("ps-client").classes;

Message.prototype.getRoomAuth = function() {
  if (this.type !== "chat") return " ";
  const user = this.raw.split("|")[3];
  const regex  = /^[a-zA-Z0-9]/;
  return regex.test(user.charAt(0)) ? " " : user.charAt(0);
};

Message.prototype.isParentRoomStaff = async function() {
  if (!this.target.roomid.includes("groupchat") || this.type !== "chat") return false;
  const parentRoom = await this.parent.getRoomDetails(this.target.roomid.split("-")[1]);
  console.log(parentRoom);
  const driver = parentRoom?.auth["%"]?.includes(this.author.userid);
  const mod = parentRoom?.auth["@"]?.includes(this.author.userid);
  const owner = parentRoom?.auth["#"]?.includes(this.author.userid);
  return [driver, mod, owner].includes(true) ? true : false;
};

Message.prototype.isStaff = function() {
  if (this.type !== "chat") return false;
  const driver = this.target?.auth["%"]?.includes(this.author.userid);
  const mod = this.target?.auth["@"]?.includes(this.author.userid);
  const owner = this.target?.auth["#"]?.includes(this.author.userid);
  return ([driver, mod, owner].includes(true) || this.isParentRoomStaff() || ["%", "@", "&"].includes(this.author.group)) ? true : false;
};
