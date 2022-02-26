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
};
