module.exports = message => {
  let run;
  const option = message.content.toLowerCase().split(" ");
  switch (option[1]) {
    case "random": 
      run = require("./random");
      break;
    default:
      run = require("./tours");
      break;
  }
  run(message, option);
	const commands = [
		"autostart 5",
		"autodq 2"
	];
	commands.forEach(e => message.reply("/tour " + e));
};
