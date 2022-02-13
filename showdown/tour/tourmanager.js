module.exports = message => {
  let run;
  const option = message.content.toLowerCase().split(" ")[1];
  if (option === "random")
      run = require("./random");
  run(message);
};
