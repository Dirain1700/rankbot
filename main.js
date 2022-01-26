module.exports = (client) => {
  /* eslint-disable */
  const fs = require("fs");
  const ws = require("ws");
  const { Discord, MessageAttachment, APIMessage, ClientApplication, MessageEmbed } = require("discord.js")
  /* eslint-enable */
  client.on("ready", async () => {
    console.log(`logged in as ${client.user.tag}`);
    client.user.setActivity("ウマ娘 プリティーダービー Season2", { type: "WATCHING" }, { status: "offline" });
    ranksort();
    const cmd = require("./config/command.js");
    const server = client.guilds.cache.get("886970564265259029");
    console.log("loaded!")
    //const ch = client.channels.cache.get("920606895117578300");
    //console.log(ch.find(c => c.name == "一般").id)
    /*await ch.messages.fetch({ limit: 5 })
      .then(message => console.log(message))
      .catch(console.error)*/
    //console.log(ch)
  });

  client.on("messageCreate", async message => {
    if (message.author.bot) {
      return;
    }
    /*if (message.content.startsWith(".foo")) {
      const name = message.content.split(" ")[1]
      const guild = message.guild;
      const userrr = await guild.members.fetch({ query: name })
        console.log(userrr)
    }*/
    /*if (message.content.startsWith(".timer")) {
      // 引数から待ち時間を取り出す
      const seconds = Number(message.content.split(" ")[1]);
      message.channel.send(`Timer set to: ${seconds}seconds!`);
      setTimeout(() => {
        message.channel.send(`<@${message.author.id}>, Time's up!`)
      }, seconds * 1000); // setTimeoutに指定するのはミリ秒なので秒数に1000を掛ける
    };*/
    if (message.content == ".help") {
      const embed = new MessageEmbed()
        .setTitle("Mogi Bot Guide v0.7.1")
        .setDescription("詳しくは、[README.md](https://github.com/Dirain1700/rankbot/blob/main/README.md)をご覧ください。\n**English**: [README-en.md](https://github.com/Dirain1700/rankbot/blob/main/README-en.md)");
      message.channel.send({ embeds: [embed] });
    }
    if (message.content.toLowerCase().startsWith(">runjs")) {
      const path = require("path");
      const pool = require("workerpool").pool(path.join(__dirname, "./config/worker.js"), {
        workerType: "process",
      });

      const codeBlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
      const languages = ["js", "javascript"];
      const toMessageOptions = content => {
        if (content.length <= 2000)
          return APIMessage.transformOptions(content, { code: "js" });
        else
          return APIMessage.transformOptions(
            "実行結果が長すぎるのでテキストファイルに出力しました。",
            new MessageAttachment(Buffer.from(content), "result.js")
          );
      };
      if (!codeBlockRegex.test(message.content))
        return message.reply("コードを送信してください。").catch(console.error);

      const codeBlock = message.content.match(codeBlockRegex) ?.groups ?? {};
      if (!languages.includes(codeBlock.lang))
        return message
          .reply(`言語識別子が**${languages.join(", ")}**である必要があります。`)
          .catch(console.error);
      pool
        .exec("run", [codeBlock.code])
        .timeout(5000
          .then(result => message.sendDeleteable(toMessageOptions(result)))
          .catch(error => message.sendDeleteable(error, { code: "js" }))
        );
    }
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand() || !interaction.guild) {
      return;
    }
    if (interaction.commandName === 'ping') {
      const now = Date.now();
      const msg = [
        "pong!",
        "",
        `gateway: ${interaction.client.ws.ping}ms`,
      ];
      await interaction.reply({ content: msg.join("\n"), ephemeral: true });
      await interaction.editReply([...msg, `往復: ${Date.now() - now}ms`].join("\n"));
      return;
    }
    if (interaction.commandName === "apt") {
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });
        return;
      }
      const how = interaction.options.getInteger("points");
      const who = interaction.options.getMember("user");
      const db = JSON.parse(fs.readFileSync("./rank.json"));
      if (who.user.id in db) { //ユーザーIDのデータがあるか判定
        // ポイント加算
        db[who.user.id].points += how;
      } else {
        // ポイント設定
        db[who.user.id] = { points: how };
      }
      // 書き換え
      fs.writeFileSync("./rank.json", db);
      ranksort();
      //送信
      await interaction.reply(`Added ${how}points to ${who.user.tag} and having ${db[who.user.id].points}points now.`);
    }
    if (interaction.commandName === "rank") {
      const who = interaction.options.getMember("user");
      ranksort();
      //JSONを読み込む
      const db = JSON.parse(fs.readFileSync("./rank.json"));
      if (!who) {
        if (interaction.user.id in db) {
          //ユーザーIDのデータがある場合
          // userIDのあるデータ
          const data = db[interaction.user.id];
          // そのデータの順位
          // とりあえず1とする
          let rank = 1;
          for (const id in db) {
            // 自分より得点が高い人がいたら、順位を下げる
            if (data.points < db[id].points) {
              rank += 1;
            }
          }
          interaction.reply({ content: `${interaction.user.tag} has ${data.points}points now and ${rank}th.`, ephemeral: true });
          return;
        } else {
          //送信
          interaction.reply({ content: `${interaction.user.tag} has 0points now.`, ephemeral: true });
          return;
        }
      } else {
        if (who.user.id in db) {
          // userIDのあるデータ
          const data = db[who.user.id];
          // そのデータの順位
          // とりあえず1とする
          let rank = 1;
          for (const id in db) {
            // 自分より得点が高い人がいたら、順位を下げる
            if (data.points < db[id].points) {
              rank += 1;
            }
          }
          interaction.reply({ content: `${who.user.tag} has ${data.points}points now and ${rank}th.`, ephemeral: true });
          return;
        } else {
          interaction.reply({ content: `${who.user.tag} has 0points now.`, ephemeral: true });
          return;
        }
      }
    }
    if (interaction.commandName === "cleartext") {
      if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        //interaction.deleteReply();
        interaction.reply({ content: "/cleartext - Access Denied.", ephemeral: true });
        return;
      }
      // 指定されたメッセージの数を取
      const how = interaction.options ?.getInteger("lines");
      const time = Math.floor(Date.now() / 1000);
      if (!how) {
        // 指定された数のメッセージを取得
        const messages = await interaction.channel.messages.fetch({ limit: 1 });
        const who = await interaction.options.getMember("user");
        // 指定されたユーザーが発言したメッセージのみを抽出
        const mentionFilter = await messages.filter(msg => msg.author.id == who.user.id);
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(mentionFilter);
        await interaction.reply({ content: `<t:${time}:T> 1 of ${who.user.id}'s message was cleard from ${interaction.channel.name} by ${interaction.user.tag}.`, ephemeral: false });
        return;
      }
      // 指定された数のメッセージを取得
      const messages = await interaction.channel.messages.fetch({ limit: how });
      const who = await interaction.options.getUser("user").id;
      const whotag = await client.users.cache.get(who).tag;
      // 指定されたユーザーが発言したメッセージのみを抽出
      const mentionFilter = await messages.filter(msg => msg.author.id === who);
      // それらのメッセージを一括削除
      interaction.channel.bulkDelete(mentionFilter);
      await interaction.reply({ content: `<t:${time}:T> ${how} of ${whotag}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`, ephemeral: false });
      return;
    }
    if (interaction.commandName === "forcecleartext") {
      if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        //interaction.deleteReply();
        interaction.reply({ content: "/forcecleartext - Access Denied.", ephemeral: true });
        return;
      }
      // 指定されたメッセージの数を取
      const who = await interaction.options.getString("userid");
      const how = interaction.options ?.getInteger("lines") ?? 1;
      const time = Math.floor(Date.now() / 1000);
      const whotag = await client.users.fetch(who).tag;
      // 指定された数のメッセージを取得
      const messages = await interaction.channel.messages.fetch({ limit: how });
      // 指定されたユーザーが発言したメッセージのみを抽出
      const mentionFilter = await messages.filter(msg => msg.author.id == who);
      // それらのメッセージを一括削除
      interaction.channel.bulkDelete(mentionFilter);
      await interaction.reply({ content: `<t:${time}:T> ${how} of ${whotag}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`, ephemeral: false });
      return;
    }
    if (interaction.commandName === "mute") {
      if (!interaction.memberPermissions.has("TIMEOUT_MEMBERS")) {
        return interaction.reply({ content: "/mute - Access denied.", ephemeral: true });
      }
      const who = interaction.options.getMember("user");
      if (who.user.id == interaction.user.id && who.user.id == interaction.guild.ownerId) {
        return interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });
      }
      const hour = interaction.options.getInteger("hours");
      const min = interaction.options.getInteger("minutes");
      const reasons = interaction.options.getString("reason");
      await who.timeout(hour * 60 * 60 * 1000 + min * 60 * 1000, `by ${interaction.user.tag}. reason: ${reasons}`);
      const time = Math.floor(Date.now() / 1000);
      if (hour === 0) {
        await interaction.reply({ content: `<t:${time}:T> ${who.user.tag} was muted for ${min}minutes by ${interaction.user.tag}. (${reasons})`, ephemeral: false });
      } else {
        await interaction.reply({ content: `<t:${time}:T> ${who.usertag} was muted for ${hour}hours and ${min}minutes by ${interaction.user.tag}. (${reasons})`, ephemeral: false });
      }
    }
    if (interaction.commandName === "unmute") {
      if (interaction.memberPermissions.has("TIMEOUT_MEMBERS")) return interaction.reply({ content: "/unmute - Access denied.", ephemeral: true });
      const who = interaction.options.getMember("user");
      const reasons = interaction.options ?.getString("reason") ?? "none";
      const time = Math.floor(Date.now() / 1000);
      if (!reasons) {
        await who.timeout(null, `by ${interaction.user.name}`);
        await interaction.reply({ content: `<t:${time}:T> ${who.user.tag} was unmuted by ${interaction.user.name}`, ephemeral: false });
        return;
      }
      await who.timeout(null, (`by ${interaction.user.tag}. reason: ${reasons}`));
      await interaction.reply({ content: `<t:${time}:T> ${who.user.tag} was unmuted by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
    }
    if (interaction.commandName === "kick") {
      if (!interaction.memberPermissions.has('KICK_MEMBERS')) {
        interaction.followUp({ content: "/kick - Access Denied.", ephemeral: true });
        return;
      }
      const who = interaction.options.getMember("user");
      if (interaction.guild.ownerId !== interaction.user.id && who.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
        return interaction.reply({ content: "Error: You cannot kick user higer role have.", ephemeral: true });
      }
      const how = interaction.options.getInteger("deletemsg");
      if (!how) {
        const messages = await interaction.channel.messages.fetch({ limit: how });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const mentionFilter = await messages.filter(msg => msg.author.id === who.user.id);
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(mentionFilter);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.members.kick(who, { days: day, reason: `by ${interaction.user.tag}. reason: ${reasons}` });
      const fetched = await client.users.fetch(who.user.id);
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${who.user.tag} was kicked from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await fetched.send(`<t:${time}:T> You (${who.user.tag}) were kicked from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName === "ban") {
      //interaction.deferReply();
      if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
        interaction.reply({ content: "/ban - Access Denied.", ephemeral: true });
        return;
      }
      const who = interaction.options.getMember("user");
      if (interaction.guild.ownerId !== interaction.user.id && who.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
        return interaction.reply({ content: "Error: You cannot BAN user higer role have.", ephemeral: true });
      }
      const how = interaction.options.getInteger("deletemsg");
      if (!how) {
        const messages = await interaction.channel.messages.fetch({ limit: how });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const mentionFilter = await messages.filter(msg => msg.author.id == who.user.id);
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(mentionFilter);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.bans.create(who, { days: day, reason: `by ${interaction.user.tag}. reason: ${reasons}` });
      const fetched = await client.users.fetch(who.user.id);
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${who.user.tag} was banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await fetched.send(`<t:${time}:T> You (${who.user.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName == "forceban") {
      if (interaction.user.id != "751433045529329825") {
        interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
        return;
      }
      const who = interaction.options.getString("userid");
      const fetched = await client.users.fetch(who);
      const how = interaction.options.getInteger("deletemsg");
      if (how != null) {
        const messages = await interaction.channel.messages.fetch({ limit: how });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const mentionFilter = await messages.filter(msg => msg.author.id == who);
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(mentionFilter);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.bans.create(fetched, { days: day, reason: `by ${interaction.user.tag}. Force-BAN. reason: ${reasons}` });
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${fetched.tag} was force-banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await fetched.send(`<t:${time}:T> You (${fetched.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName === "unban") {
      if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
        return interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
      }
      const who = interaction.options.getString("userid");
      const fetched = await client.users.fetch(who);
      const reasons = interaction.options ?.getString("reason") ?? "none";
      const time = Math.floor(Date.now() / 1000);
      await interaction.guild.bans.remove(fetched, `by ${interaction.user.name}. reason: ${reasons}`);
      await interaction.reply({ content: `<t:${time}:T> ${fetched.tag} was unbanned from ${interaction.guild.name} by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
    }
  });

  function ranksort() {
    const db = JSON.parse(fs.readFileSync("./rank.json"));
    const obj = Object.entries(db);
    obj.sort((a, b) => b[1].points - a[1].points);
    const edit = JSON.stringify(Object.fromEntries(tmp), null, 4);
    fs.writeFileSync("./rank.json", edit);
    return;
  }
};
