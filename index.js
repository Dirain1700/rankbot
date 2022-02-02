/* eslint-disable no-unused-vars*/
const http = require("http");
const querystring = require("querystring");
global.fs = require("fs");
global.config = require("./config/config");
const pages = fs.readFileSync("./config/index.html");
const { Intents,Client,ClientApplication } = require("discord.js");
const PSClient = require("ps-client").Client;

let ps = new PSClient(config.ops);
const client = new Client(config.options);
const main = require("./main.js");
const showdown = require("./showdown.js");
main(client, ps);
showdown(client, ps);

/* eslint-enable */
http.createServer((req, res) => {
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

client.login( config.token );
ps.connect();

/*hotpatch commands*/
/*Discord hotpatch commands*/
client.on("messageCreate", async msg => {
  if (msg.author.id != config.admin) return;
  if (msg.content.startsWith(".hotpatch")) {
    let reload;
    let target;
    if (msg.content.endsWith("config")) return msg.channel.send("hotpatch doesn't support config files.");
    if (msg.content.endsWith("discord")){
      target = "./main"; 
      reload = (() => {
        const file = require("./main");
        file(client);
      });
    }
    if (msg.content.endsWith("showdown")){
      target = "./showdown";
      reload = (() => {
        const file = require("./showdown");
        file(ps);
      });
    }
    if (!target) return msg.channel.send("ReferenceError: \"target\" is not defiend");
    await delete require.cache[require.resolve(target)];
    await reload();
    await msg.channel.send(`Sucsessfuly hotpatched: ${target + ".js"}`);
  }
});

ps.on("message", async msg => {
  if (msg.author.id != config.owner) return;
  if (msg.content.startsWith(".hotpatch")) {
    let reload;
    let target;
    if (msg.content.endsWith("config")) return msg.privateReply("hotpatch doesn't support config files.");
    if (msg.content.endsWith("discord")){
      target = "./main"; 
      reload = (() => {
        const file = require("./main");
        file(client);
      });
    }
    if (msg.content.endsWith("showdown")){
      target = "./showdown";
      reload = (() => {
        const file = require("./showdown");
        file(ps);
      });
    }
    if (!target) return msg.channel.send("ReferenceError: \"target\" is not defiend");
    await delete require.cache[require.resolve(target)];
    await reload();
    await msg.reply(`Successfuly hotpatched: ${target + ".js"}`);
  }
});

