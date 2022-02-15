module.exports = message => {
  let run;
  const option = message.content.toLowerCase().split(" ")[1];
  switch (option) {
    case "random": 
      run = require("./random");
      break;
    default:
      run = require("./tours");
      break;
  };
  run(message, option);
};
