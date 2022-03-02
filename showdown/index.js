module.exports = (client, ps) => {
  require("./structures");
  global.tool = require("ps-client").Tools;
  ps.on("ready", async () => {
    console.log("Logged in as " + config.ops.username);
    //console.log(await ps.getRoomDetails("japanese"));
    console.log(await ps.getUserDetails("system"));
    ps.send("|/j lobby");
    //setTimeout(() => console.clear(), 4500)
    setTimeout(() => ps.send("|/l lobby"), 1000);
    setTimeout(() => process.exit(0), 10000);
  });
  
  ps.on("message", message => {
    if (message.isIntro || message.author.name === ps.status.username) return;
    if (message.content === ".resetlog") {
      const run = require("./global/resetlog");
      run(message);
    }
    if (message.content.startsWith(".hotpatch")) {
      const run = require("./global/hotpatch");
      run(message);
    }
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "pm" || message.author.name === ps.status.username) return;
    if (message.content.startsWith("/invite")) {
      const run = require("./pm/invite");
      run(ps, message);
    }
    if (message.content.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    if (message.content === "process.exit(0)" && message.author.userid === "dirain") process.exit(0);
  });
  
  ps.on("message", async message => {
    if (message.isIntro || message.type !== "chat") return;
    if (message.target.roomid.includes("japanese")) logmsg(message);
    if (message.content.startsWith("/log") && (message.target.roomid).includes("japanese")) {
      const run = require("./chat/sendlog");
      run(client, ps, message);
    }
    if (message.content.startsWith(">runjs")) {
      const run = require("./chat/runjs");
      run(message);
    }
    if (message.content.startsWith(".nt")) {
      if (!message.author.isStaff("chat", message.target)) return;
      const run = require("./tour/tourmanager");
      run(message);
    }
  });

  ps.on("leave", async (room, user, isIntro) => {
    if (isIntro) return;
    if (user.startsWith("*")) return;
    console.log(room, user);
    room = await ps.getRoomDetails(tool.toID(room));
    user = await ps.getUserDetails(tool.toID(user));
    /*
    const targetRoom = await ps.getRoomDetails(tool.toID(room));
    const targetUser = await ps.getUserDetails(tool.toID(user));*/
    
    //if (room.visibility === "hidden") return;
    console.log(room);
    console.log(user);
    //const onlineStaffs = room.users.filter(user.isStaff("chat", room));
      //console.log(onlineStaffs)
    //if (!onlineStaffs.length) room.send("/modchat trusted");
  });
  
  ps.on("join", async (room, user, isIntro) => {
    if (isIntro) return;
    if (user.startsWith("*")) return;
    console.log(room, user);
    
    room = await ps.getRoomDetails(tool.toID(room));
    user = await ps.getUserDetails(tool.toID(user));
    /*
    const targetRoom = await ps.getRoomDetails(tool.toID(room));
    const targetUser = await ps.getUserDetails(tool.toID(user));
    */
    //if (room.visibility === "hidden") return;
    console.log(room);
    console.log(user);
    //const onlineStaffs = room.users.filter(user.isStaff("chat", room));
    //console.log(room)
    //if (onlineStaffs.length > 0) room.send("/modchat ac");
  });

  function logmsg(message) {
      const msgtime = Math.floor(message.time / 1000);
      const add = {
        "time": msgtime,
        "user": message.author.userid,
        "content": message.content
      };
      const file = path.resolve(__dirname, "./../config/log/chatlog.json");
      const json = JSON.parse(fs.readFileSync(file));
      json.push(add);
      json.sort((a, b) => b.time - a.time);
      fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};
