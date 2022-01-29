[![Node.js CI (master)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml) [![Node.js CI (full)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=dev&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml)

# 環境
言語は<b>JavaScript</b>です。
- Windows10
- Node.js v16.13.2
- Visual Studio Code
- discord.js v13.6.0

# 機能
全部コード書いても長くなるだけなんでGitHub見てください()<br/>
DMかサポートチャンネルで質問を受け付けますので、なんかあったら聞いてください。

[Dirain1700/rankbot at main](https://github.com/Dirain1700/rankbot)


# 実装済み

### 雑用

- `/ping` (ping値を測定する。)

### サーバー管理

- `/ban [ユーザー] [日数] [理由] [メッセージ数]` (運営向け)
- `/forceban [ユーザーID] [日数] [理由] [メッセージ数]` (運営向け。BANするユーザーがサーバーにいない場合。)
- `/unban [ユーザーID] [理由(任意)]` (運営向け)
- `/kick [ユーザー] [理由] [メッセージ数]` (運営向け)
- `/mute [ユーザー] [時間(0-23)] [分(0-60)] [理由]` (運営向け)
- `/unmute [ユーザー] [理由]` (運営向け)
- `/cleartext [ユーザー名] [メッセージ数(指定しない場合は1)]` (運営向け)
- `/forcecleartext [ユーザー名] [メッセージ数(指定しない場合は1)]` (運営向け)


### ユーザーのポイント管理

- `/apt [点数] [ユーザー名]` (運営向け)<br />
- `/rank [ユーザー名(任意)]`

# 実装予定

上位数人の出力
