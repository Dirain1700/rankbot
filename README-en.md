[![Node.js CI (full)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=main&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml) [![Node.js CI (full)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=dev&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml)

# Development Environments
Using <b>JavaScript</b>.
- Windows10
- Node.js v16.14.2
- Visual Studio Code
- discord.js v13.6.0
- PS-Client v1.4.1

# Codes
All source are on GitHub.<br/>
If you have any questions, feel free to ask them in DM or support channel.

[Dirain1700/rankbot](https://github.com/Dirain1700/rankbot)


# Functions

## Discord
### No classification

- `/ping` (Measuring the Ping values)
- `>runjs ```js ` <br> `JavaScript code here` <br> ` ``` ` <br >Run JavaScript and reply the result. Some functions are not available.
- `/register` see [Registring Guide](https://gist.github.com/Dirain1700/f2c01cebe77dc495b6453dbdfa9d23df)

### Manage server

- `/ban [user] [days] [reason] [message count (If you wish delete messages, optional)]` (for moderation team)
- `/forceban [user ID] [days] [reason] [message count (If you wish delete messages, optional)]` (for moderation team, to BAN users if a user isn't on server.)
- `/unban [user ID] [reason(optional)]` (for moderation team)
- `/kick [user] [reason] [message count (If you wish delete messages, optional)]` (for moderation team)
- `/mute [user] [hour(0-23)] [minutes(0-60)] [reason]` (for moderation team)
- `/unmute [user] [reason]` (for moderation team)
- `/cleartext [user] [message count(optional, default: 1)]` (for moderation team)
- `/forcecleartext [user ID] [message count(optional, default: 1)]` (for moderation team)


### Manage points

- `/apt [points] [user]` (for moderation team)<br />
- `/rank [user(optional, default to your rank)]`

## Pokémon Showdown
### No classification
- `>runjs ```js ` <br> `JavaScript code here` <br> ` ``` ` <br >Run JavaScript and reply the result. Some functions are not available.
### Tournament
- `?nt [options]` Create a tournament with option what you chose.
 #### option
 - `random` Bot will choose format randomly from [formatList](./showdown/tour/formatnames.js) and create a tour.
 - `bss9` Bot will open tour with a format: [Gen 8] Battle Stadium Singles Series 9.
# Futures

None

# LICENSE

[MIT LICENSE](./LICENSE)
