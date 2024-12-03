[![Node.js CI](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=main&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml)

# Development Environments

- Windows 11
- Node.js v20.16.0
- Visual Studio Code

# Codes

All source are on GitHub.<br/>
If you have any questions, feel free to ask them in Discord!

# Setup

Use Node.js v20.

```
git clone https://github.com/Dirain1700/rankbot.git

cd rankbot

npm install

cp config/config-example.ts config/config.ts
```

Edit config.ts and run `npm start`!

## Detecting unique characters for Chinese

You can detect unique characters for Chinese:

```
cp src/detect-zh/setup/config-example.ts src/detect-zh/setup/config.ts
```

Edit `src/detect-zh/setup/config.ts` if you need.
Run `npm run setup-zh` to build zh-detector!

# Futures

None

# LICENSE

[MIT LICENSE](./LICENSE)
