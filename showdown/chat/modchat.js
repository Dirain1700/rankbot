module.exports = (client, room, user, isIntro) => {
	if (isIntro || room !== "japanese") return;
	const targetUser = client.getUser(tool.toID(user));
	const targetRoom = client.getRoom(room);
	if (!targetUser.isStaff("room", targetRoom)) return;
	const users = targetRoom.users.map(u => client.getUser(tool.toID(u)));
	const isStaffOnline = users.some(u => u.isStaff("room", targetRoom));
	if (isStaffOnline) return;
	["!rfaq modchat", "/modchat +"].forEach(e => room.send(e));
};