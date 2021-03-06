[![Node.js CI (full)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=main&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml) [![Node.js CI (full)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml/badge.svg?branch=dev&event=push)](https://github.com/Dirain1700/rankbot/actions/workflows/node.js.yml)

Looking for English version? visit [README-en.md](./README-en.md)!

# 環境

言語は<b>JavaScript</b>です。

-   Windows10
-   Node.js v16.14.2
-   Visual Studio Code
-   discord.js v13.6.0
-   PS-Client v1.4.1

# 実装済み

## Discord

### 雑用

-   `/ping` (ping 値を測定する。)
-   ` >runjs ```js  ` <br> `JavaScriptをここに` <br> ` ``` ` <br >JavaScript を実行し、結果を返信します。一部使用できない機能があります。
-   `/resgister` [Registering Guide](https://gist.github.com/Dirain1700/f2c01cebe77dc495b6453dbdfa9d23df)

### サーバー管理

-   `/ban [ユーザー] [日数] [理由]` (運営向け)
-   `/forceban [ユーザーID] [日数] [理由]` (運営向け。BAN するユーザーがサーバーにいない場合。)
-   `/unban [ユーザーID] [理由(任意)]` (運営向け)
-   `/kick [ユーザー] [理由]` (運営向け)
-   `/mute [ユーザー] [時間(0-23)] [分(0-60)] [理由]` (運営向け)
-   `/unmute [ユーザー] [理由]` (運営向け)
-   `/cleartext [ユーザー名] [メッセージ数(指定しない場合は1)]` (運営向け)
-   `/forcecleartext [ユーザー名] [メッセージ数(指定しない場合は1)]` (運営向け)

### ユーザーのポイント管理

-   `/apt [点数] [ユーザー名]` (運営向け)<br />
-   `/rank [ユーザー名(任意)]`

## PS

### トーナメント

-   `?nt [options]` 指定したオプションでトーナメントを作成します。

#### オプション

-   `random` [フォーマット](./showdown/tour/formatnames.js)一覧の中からランダムに選び、トーナメントを開催します。

# 実装予定

上位数人の出力

# LICENSE

[MIT LICENSE](./LICENSE)
