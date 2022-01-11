/* eslint-disable */
const http = require("http");
const querystring = require("querystring");
const fs = require("fs")
const pages = fs.readFileSync("./metas/index.html")
const {Intents,Client,ClientApplication,Discord} = require('discord.js');
const options = {
   intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS", "GUILD_BANS","GUILD_MESSAGE_REACTIONS"],
};
const client = new Client(options);
const main = require("./main.js");
main(client);
/* eslint-enable */
http.createServer(function(req, res){
  if (req.method == "POST"){
    let data = "";
    req.on("data", function(chunk){
      data += chunk;
    });
    req.on("end", function(){
      if(!data){
        res.end("No post data");
        return;
      }
      const dataObject = querystring.parse(data);
      if(dataObject.type == "wake"){
        res.end();
        return;
  }
    });
  }
  else if (req.method == "GET"){
   res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
   res.end(pages);
 }
}).listen(3000);

client.login( process.env.DISCORD );
