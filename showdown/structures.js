const { Message, User } = require("ps-client").classes;

Message.prototype.getRoomAuth = function() {
  if (this.type !== "chat") return " ";
  const user = this.raw.split("|")[3];
  const regex  = /^[a-zA-Z0-9]/;
  return regex.test(user.charAt(0)) ? " " : user.charAt(0);
};

User.prototype.isParentRoomStaff = async function(room) {
  if (typeof room !== "object" || !room.roomid) throw new Error("Input must be an object with userid for new Room");
  if (!room.roomid.includes("groupchat") || this.type !== "chat") return false;
  const parentRoom = await this.parent.getRoomDetails(room.roomid.split("-")[1]);
  const driver = parentRoom?.auth["%"]?.includes(this.userid);
  const mod = parentRoom?.auth["@"]?.includes(this.userid);
  const owner = parentRoom?.auth["#"]?.includes(this.userid);
  return [driver, mod, owner].includes(true) ? true : false;
};

User.prototype.isStaff = function(type, room) {
  if (typeof room !== "object" || !room.roomid) throw new Error("Input must be a Class Room");
  type = type.toLowerCase();
  if (!["room", "global"].includes(type)) throw new Error("Input must be \"room\" or \"global\"");
  if (type === "global") {
    if (room) throw new Error("Do not input room when chose type: global");
    return ["%", "@", "&"].includes(this.group) ? true : false;
  }
  const driver = room?.auth["%"]?.includes(this.userid);
  const mod = room?.auth["@"]?.includes(this.userid);
  const owner = room?.auth["#"]?.includes(this.userid);
  return [
    [driver, mod, owner].includes(true),
    this.isParentRoomStaff(room),
    ["%", "@", "&"].includes(this.group)
  ].includes(true) ? true : false;
};
