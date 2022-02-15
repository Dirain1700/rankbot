module.exports = message => {
  let run;
  const option = message.content.toLowerCase().split(" ")[1];
  switch (option) {
    case "random": 
      run = require("./random");
      break;
    case "bsss9":
      run = require("./bsss9");
      break;
  };
  run(message);
};
