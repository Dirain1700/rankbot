module.exports = ps => {
  require("./structures");
  ps.on("leave", async (room, user) => {
    const targetRoom = await ps.getRoomDetails(room);
    const targetUser = tool.toID(user);
    //if (room.visibility === "hidden") return;
    console.log(targetRoom);
    console.log(targetUser);
    const onlineStaffs = room.users.filter(user.isStaff("chat", room));
    if (!onlineStaffs.length) room.send("/modchat trusted");
  });
  ps.on("join", async (room, user) => {
    const targetRoom = await ps.getRoomDetails(room);
    const targetUser = tool.toID(user);
    //if (room.visibility === "hidden") return;
    console.log(targetRoom);
    console.log(targetUser);
    const onlineStaffs = room.users.filter(user.isStaff("chat", room));
    if (onlineStaffs.length > 0) room.send("/modchat ac");
  });
};
