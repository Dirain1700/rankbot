module.exports = message => {
	const modchatRegex = /<div class="broadcast-red"><strong>Moderated chat was set to (?<modchatLevel>(off|autoconfirmed|trusted|\+|%|@|\*|player|#|&))!<\/strong><br \/>Only users of rank (off|autoconfirmed|trusted|\+|%|@|\*|player|#|&) and higher can talk.<\/div>/;
	if (modchatRegex.test(message.content.substring(5))) {
		message.target.send("!rfaq modchat");
	}
};