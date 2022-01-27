module.exports = {
  token: "DISCORD TOKEN HERE", //leave blank to disable Discord
  options: {
   intents: ["Intents here"],
},
  ops: {
  "username": "String",
  "password": "String",
  "avatar": "String or Number",
  "status": "String",
  "autoJoin": ["Room ID here"]
  },
  logch: "String(channel ID)",// Please do not use this without permission from a room owner
  owner: "PS Username",
  admin: ["String(User ID)"], // Array of Discord IDs of administrators
}