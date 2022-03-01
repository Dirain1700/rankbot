module.exports = ps => {
  require("./structures");
  ps.on("leave", async (room, user) => {
    room = await ps.getRoomDetails(room);
    user = await ps.getUserDetails(user);
    if (room.visibility === "hidden") return;
    const onlineStaffs = room.users.filter(user.isStaff("chat", room));
    if (!onlineStaffs.length) room.send("/modchat trusted");
  });
  ps.on("join", async (room, user) => {
    room = await ps.getRoomDetails(room);
    user = await ps.getUserDetails(user);
    if (room.visibility === "hidden") return;
    const onlineStaffs = room.users.filter(user.isStaff("chat", room));
    if (onlineStaffs.length > 0) room.send("/modchat ac");
  });
};
