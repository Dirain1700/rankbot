module.exports = {
  token: process.env.DISCORD, //leave blank to disable Discord
  options: {
   intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS", "GUILD_BANS","GUILD_MESSAGE_REACTIONS"],
},
  ops: {
  "username": "Dirain1700~!",
  "password": process.env.PS,
  "avatar": "lillie-z",
  "status": "Hi! I am a bot! :)",
  "autoJoin": ["Japanese"]
  },
  logch: "886970564265259032",// Please do not use this without permission from a room owner
  owner: "dirain",
  admin: ["751433045529329825"], // Array of Discord IDs of administrators
  log: ["was banned", "was warned", "was muted", "was promoted", "was demoted"],
  hide: "were cleared",
}