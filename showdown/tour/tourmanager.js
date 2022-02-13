module.exports = message => {
  let run;
  switch (message.content.split(" ")[1]) {
    case "random":
      run = require("./random");
      break;
  };
  run(message);
};
