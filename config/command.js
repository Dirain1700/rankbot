"use strict";

module.exports = {
    send: {
        name: "send",
        description: "Send a message via a bot.",
        options: [
            {
                type: "CHANNEL",
                name: "channel",
                description: "A channel to send content",
                required: "true",
            },
            {
                type: "STRING",
                name: "type",
                description: "A type of content to send",
                required: true,
                choices: [
                    {
                        name: "string",
                        value: "string",
                    },
                    {
                        name: "embeds",
                        value: "embeds",
                    },
                    {
                        name: "string with content",
                        value: "string with content",
                    },
                ],
            },
        ],
    },
    sendid: "962586850416021584",
    hotpatch: {
        name: "hotpatch",
        description: "再起動せずに再読み込みをします。",
        options: [
            {
                type: "STRING",
                name: "module",
                description: "モジュールを指定します。",
                required: true,
            },
        ],
    },
    hotpatchid: "940917030943621150",
    forcehotpatch: {
        name: "forcehotpatch",
        description: "再起動せずに再読み込みをします。",
        options: [
            {
                type: "STRING",
                name: "module",
                description: "モジュールを指定します。",
                required: true,
            },
        ],
    },
    forcehotpatchid: "961666038087417876",
    verify: {
        name: "verify",
        description: "Verify your account of Pokémon Showdown.",
        options: [
            {
                type: "STRING",
                name: "userid",
                description: "Input an userid of Pokémon showdown. Type your name only Alphabet or Number(a-z, 0-9)!",
                required: true,
            },
        ],
    },
    verifyid: "961073227763953674",
    ping: {
        name: "ping",
        description: "ping値を測定します。",
    },
    pingid: "918513989019918396",
    cleartext: {
        name: "cleartext",
        description: "特定のユーザーのメッセージを削除します。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定します。",
                required: true,
            },
            {
                type: "INTEGER",
                name: "lines",
                description: "削除するメッセージ数を指定します。",
                required: false,
                minValue: 1,
                maxValue: 100,
            },
        ],
    },
    cleartextid: "919103706790768660",
    forcecleartext: {
        name: "forcecleartext",
        description: "特定のユーザーのメッセージを強制的に削除します。",
        options: [
            {
                type: "STRING",
                name: "userid",
                description: "ユーザーIDを指定します。",
                required: true,
            },
            {
                type: "INTEGER",
                name: "lines",
                description: "削除するメッセージ数を指定します。",
                required: false,
                minValue: 1,
                maxValue: 100,
            },
        ],
    },
    forcecleartextid: "926398227757039667",
    kick: {
        name: "kick",
        description: "ユーザーをkickします。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定します。",
                required: true,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: true,
            },
        ],
    },
    kickid: "926398227106918441",
    ban: {
        name: "ban",
        description: "ユーザーをBANします。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定します。",
                required: true,
            },
            {
                type: "INTEGER",
                name: "days",
                description: "BANする期間を指定します。",
                required: true,
                minValue: 1,
                maxValue: 365,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: true,
            },
        ],
    },
    banid: "919455366012604446",
    forceban: {
        name: "forceban",
        description: "ユーザーを強制的にBANします。",
        options: [
            {
                type: "INTEGER",
                name: "user",
                description: "ユーザーIDを指定します。",
                required: true,
            },
            {
                type: "INTEGER",
                name: "days",
                description: "BANする期間を指定します。",
                required: true,
                minValue: 1,
                maxValue: 365,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: true,
            },
        ],
    },
    forcebanid: "926398227744448512",
    unban: {
        name: "unban",
        description: "ユーザーをUnBANします。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定します。",
                required: true,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: true,
            },
        ],
    },
    mute: {
        name: "mute",
        description: "ユーザーが指定した時間だけこのサーバーで操作ができないようにします。24時間以上はbanを使用してください。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定します。",
                required: true,
            },
            {
                type: "INTEGER",
                name: "hours",
                description: "時間を指定します。24時間以上はBANを使用してください。",
                required: true,
                minValue: 0,
                maxValue: 23,
            },
            {
                type: "INTEGER",
                name: "minutes",
                description: "分を指定します。0から60の範囲で指定できます。",
                required: true,
                minValue: 1,
                maxValue: 60,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: true,
            },
        ],
    },
    muteid: "924502626488434720",
    unmute: {
        name: "unmute",
        description: "ユーザーのミュート状態を解除します。",
        options: [
            {
                type: "USER",
                name: "user",
                description: "ユーザーを指定してください。",
                required: true,
            },
            {
                type: "STRING",
                name: "reason",
                description: "理由",
                required: false,
            },
        ],
    },
    unmuteid: "924504608942981140",
};
