module.exports = (client, room, user, isIntro) => {
	if (isIntro || room !== "japanese") return;
	if (!user) return;
	if (!user.isStaff("room", room)) return;
	const users = room.users.map(u => client.getUser(tool.toID(u)));
	const isStaffOnline = users.some(u => u.isStaff("room", room));
	if (isStaffOnline) return;
	["!rfaq modchat", "/modchat +"].forEach(e => room.send(e));
};