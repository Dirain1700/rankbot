module.exports = {
  ping: {
    name: "ping",
    description: "ping値を測定します。",
  },
  pingid: "918513989019918396",
  top: {
    name: "top",
    description: "得点上位5人を表示します。" 
  },
  topid: "925288265060327444",
  rank: {
    name: "rank",
    description: "任意のユーザーのポイントを表示します。",
    defaultPermission: true,
    options: [
      {
        type:"USER",
        name: "user",
        description: "ユーザーを指定します。指定されていない場合は自分のものが表示されます。"
      }
    ]
  },
  rankid: "917032237634060350",
  apt: {
    name: "apt",
    description: "ユーザーに任意のポイントを与えます。",
    defaultPermission: true,
    options: [
      {
        type: "USER",
        name: "user",
        description: "ユーザー",
        required: true
      },
      {
        type: "INTEGER",
        name: "points",
        description: "点数",
        required: true,
        minValue: 1,
        maxValue: 12
      }
    ]
  },
  aptid: "916920839054688317",
  rpt: {
    name: "rpt",
    description: "ユーザーから任意のポイントを剥奪します。",
    defaultPermission: true,
    options: [
      {
        type: "USER",
        name: "user",
        description: "ユーザー",
        required: true
      },
      {
        type: "INTEGER",
        name: "points",
        description: "点数",
        required: true,
        minValue: 1
      }
    ]
  },
  rptid: "936238168674549832",
  resetboard: {
    name: "resetleaderboard",
    description: "リーダーボードをリセットします。"
  },
  resetboardid: "936238169689563216",
  cleartext: {
    name: "cleartext",
    description: "特定のユーザーのメッセージを削除します。",
    options: [
      {
        type: "USER",
        name: "user",
        description: "ユーザーを指定します。",
        required: true
      },
      {
        type: "INTEGER",
        name: "lines",
        description: "削除するメッセージ数を指定します。",
        required: false,
        minValue: 1,
        maxValue: 100
      }
    ]
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
        required: true
      },
      {
        type: "INTEGER",
        name: "lines",
        description: "削除するメッセージ数を指定します。",
        required: false,
        minValue: 1,
        maxValue: 100
      }
    ]
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
        required: true
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: true
      },
      {
        type: "INTEGER",
        name: "deletemsg",
        description: "メッセージを削除する場合は数を指定してください。",
        required: false,
        minValue: 1,
        maxValue: 100
      }
    ]
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
        required: true
      },
      {
        type: "INTEGER",
        name: "days",
        description: "BANする期間を指定します。",
        required: true,
        minValue: 1,
        maxValue: 365
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: true
      },
      {
        type: "INTEGER",
        name: "deletemsg",
        description: "メッセージを削除する場合は数を指定してください。",
        required: false,
        minValue: 1,
        maxValue: 100
      }
    ]
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
        required: true
      },
      {
        type: "INTEGER",
        name: "days",
        description: "BANする期間を指定します。",
        required: true,
        minValue: 1,
        maxValue: 365
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: true
      },
      {
        type: "INTEGER",
        name: "deletemsg",
        description: "メッセージを削除する場合は数を指定してください。",
        required: false,
        minValue: 1,
        maxValue: 100
      }
    ]
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
        required: true
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: true
      }
    ]
  },
  mute: {
    name: "mute",
    description: "ユーザーが指定した時間だけこのサーバーで操作ができないようにします。24時間以上はbanを使用してください。",
    options: [
      {
        type: "USER",
        name: "user",
        description: "ユーザーを指定します。",
        required: true
      },
      {
        type: "INTEGER",
        name: "hours",
        description: "時間を指定します。24時間以上はBANを使用してください。",
        required: true,
        minValue: 0,
        maxValue: 23
      },
      {
        type: "INTEGER",
        name: "minutes",
        description: "分を指定します。0から60の範囲で指定できます。",
        required: true,
        minValue: 1,
        maxValue: 60
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: true
      }
    ]
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
        required: true
      },
      {
        type: "STRING",
        name: "reason",
        description: "理由",
        required: false
      }
    ]
  },
  unmuteid: "924504608942981140"
}
