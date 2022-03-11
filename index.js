global.fs = require("fs");
global.config = require("./config/config");
global.path = require("path");
const html = fs.readFileSync("./config/index.html");
const { Client } = require("discord.js");
const PSClient = require("ps-client").Client;

let ps = new PSClient(config.ops);
const client = new Client(config.options);
const discord = require("./discord/index");
const showdown = require("./showdown/index");
discord(client);
showdown(client, ps);

require("http").createServer((req, res) => {
  if (req.method == "POST"){
    let data = "";
    req.on("data", function(chunk){
      data += chunk;
    });
    req.on("end", () => {
      if(!data){
        res.end("No post data");
        return;
      }
      const dataObject = require("querystring").parse(data);
      if(dataObject.type == "wake"){
        res.end();
        return;
      }
    });
  }
  else if (req.method == "GET"){
   res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
   res.end(html);
 }
}).listen(3000);

//client.login( config.token );
ps.connect();
