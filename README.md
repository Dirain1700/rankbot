[![Node.js CI](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml)

# 環境
言語は<b>JavaScript</b>です。
## 開発環境
- Windows10
- Node.js v16.13.0
- Visual Studio Code
- discord.js v13.3.1

## 実行環境
- Replit (Node.js v16.13.1)
- discord.js v13.3.1

# 機能
全部コード書いても長くなるだけなんでGitHub見てください()<br/>
DMかサポートチャンネルで質問を受け付けますので、なんかあったら聞いてください。

[Dirain1700/rankbot at master](https://github.com/Dirain1700/rankbot)


# 実装済み

### 雑用

- `.timer [seconds秒数]` (タイマー)

### サーバー管理

- `/ban [ユーザー] [days] [理由] [メッセージ数]` (運営向け)
- `/mute [ユーザー] [時間(0-23)] [分(0-60)] [理由]` (運営向け)
- `/unmute [ユーザー] [理由]` (運営向け)

### ユーザーのポイント管理

- `.apt [点数] [ユーザーをメンション]` (運営向け)
- `/apt [点数] [ユーザー名]` (上のスラッシュコマンド版。なお処理は遅い。)<br />

- `.rank [ユーザーID(任意)]` (自分のポイントを見る。ユーザーIDを入れたらそのユーザーを。)
- `/rank [ユーザー名(任意)` (スラッシュコマンド版。これも処理が遅い。)

あと[keyv](https://www.npmjs.com/package/keyv)と[@keyv/sqlite](https://www.npmjs.com/package/@keyv/sqlite)からJSONに移行したりした。めんどい。

### 指定したユーザーのメッセージを指定件数だけ削除

- `.clm [件数] [ユーザーをメンション]` (運営向け)
- `/cleartext [ユーザー名] [件数(任意)]` (上のスラッシュコマンド版。なお処理(ry)

# 実装予定

- ポイントをソートして順位を出力
- コードの分割
