const { User } = require("ps-client").classes;

User.prototype.isRoomVoice = function (room) {
    if (typeof room !== "object" || !room.roomid) throw new Error("Input must be an object with userid for new Room");
    return room.auth["+"].includes(this.userid) || this.isStaff("room", room) || ["+", "%", "@", "*", "&"].includes(this.group);
};

User.prototype.isParentRoomStaff = async function (room) {
    if (typeof room !== "object" || !room.roomid) throw new Error("Input must be an object with userid for new Room");
    if (!room.roomid.includes("groupchat") || room.type !== "chat") return false;
    const parentRoom = this.parent.getRoom(room.roomid.split("-")[1]);
    const driver = parentRoom?.auth["%"]?.includes(this.userid);
    const mod = parentRoom?.auth["@"]?.includes(this.userid);
    const owner = parentRoom?.auth["#"]?.includes(this.userid);
    return driver || mod || owner;
};

User.prototype.isStaff = function (type, room) {
    if (typeof room !== "object" || !room.roomid) throw new Error("Input must be a Class Room");
    type = type.toLowerCase();
    if (!["room", "global"].includes(type)) throw new Error("Input must be 'room' or 'global'.");
    if (type === "global") {
        if (room) throw new Error("Do not input room when chose type: global");
        return ["%", "@", "&"].includes(this.group) ? true : false;
    }
    const driver = room?.auth["%"]?.includes(this.userid);
    const mod = room?.auth["@"]?.includes(this.userid);
    const owner = room?.auth["#"]?.includes(this.userid);
    return driver || mod || owner || this.isParentRoomStaff(room);
};
