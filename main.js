module.exports = (client) => {
  /* eslint-disable no-unused-vars*/
  const fs = require("fs");
  const ws = require("ws");
  const { MessageAttachment, MessagePayload, ClientApplication, MessageEmbed } = require("discord.js");
  /* eslint-enable */
  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("ウマ娘 プリティーダービー Season2", { type: "WATCHING" }, { status: "busy" });
    ranksort();
    //eslint-disable-next-line no-unused-vars
    const cmd = require("./config/command.js");
  });
  
  client.on("messageCreate", async message => {
    //if (message.author.bot) return;
    /*if (message.content.startsWith(".foo")) {
      const targetName = message.content.split(" ")[1];
      const guild = message.guild;
      const targetMember = await guild.members.fetch({ query: name });
      message.channel.send(targetMember.user.tag);
        console.log(targetUser);
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
        .setTitle("Mogi Bot Guide v0.7.13")
        .setDescription("詳しくは、[README.md](https://github.com/Dirain1700/rankbot/blob/main/README.md)をご覧ください。\n**English**: [README-en.md](https://github.com/Dirain1700/rankbot/blob/main/README-en.md)");
      message.channel.send({ embeds: [embed] });
    }
    /*Forked from https://github.com/InkoHX/vm2-discordjs*/
    if (message.content.toLowerCase().startsWith(">runjs")) {
      const { codeBlock } = require("@discordjs/builders");
      require("./vm2/msg");
      const path = require("path");
      const pool = require("workerpool").pool(path.join(__dirname, "./vm2/worker.js"), {
        workerType: "process",
      });

      const BlockRegex = /^`{3}(?<lang>[a-z]+)\n(?<code>[\s\S]+)\n`{3}$/mu;
      const languages = ["js", "javascript"];
      const toMessageOptions = content => {
        if (content.length <= 2000)
          return codeBlock("js", content);
        else
          return MessagePayload.create(message.channel, {
            content: "実行結果が長すぎるのでテキストファイルに出力しました。",
            attachment: [new MessageAttachment(codeBlock("js", Buffer.from(content)), "result.js")]
      });
      };
      if (!BlockRegex.test(message.content))
        return message.reply("コードを送信してください。").catch(console.error);

      const Blockcontent = message.content.match(BlockRegex) ?.groups ?? {};
      if (!languages.includes(Blockcontent.lang))
        return message
          .reply(`言語識別子が**${languages.join(", ")}**である必要があります。`)
          .catch(console.error);
      
      pool
        .exec("run", [Blockcontent.code])
        .timeout(5000)
        .then(result => message.sendDeletable(toMessageOptions(result)))
        .catch(error => message.sendDeletable(codeBlock("js", error)));
    }
    /*End of fork*/
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand() || !interaction.guild) {
      return;
    }
    if (interaction.commandName === "ping") {
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
      const target = interaction.options.getMember("user");
      const db = JSON.parse(fs.readFileSync("./rank.json"));
      //const db = Object.entries(rawdb);
      if (target.user.id in db) { //ユーザーIDのデータがあるか判定
        // ポイント加算
        db[target.user.id].points += how;
      } else {
        // ポイント設定
        db[target.user.id] = { points: how };
      }
      // 書き換え
      fs.writeFileSync("./rank.json", JSON.stringify(db, null, 2));
      ranksort();
      //送信
      await interaction.reply(`Added ${how}points to ${target.user.tag} and having ${db[target.user.id].points}points now.`);
    }
    if (interaction.commandName === "rpt") {
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({ content: "/apt - Access Denied.", ephemeral: true });
        return;
      }
      const how = interaction.options.getInteger("points");
      const target = interaction.options.getMember("user");
      const db = JSON.parse(fs.readFileSync("./rank.json"));
      //const db = Object.entries(rawdb);
      if (target.user.id in db) { //ユーザーIDのデータがあるか判定
        // ポイント加算
        db[target.user.id].points -= how;
      } /*else {
        // ポイント設定
        db[target.user.id] = { points: how };
      }*/
      // 書き換え
      fs.writeFileSync("./rank.json", JSON.stringify(db, null, 2));
      ranksort();
      //送信
      await interaction.reply(`Removed ${how}points to ${target.user.tag} and having ${db[target.user.id].points}points now.`);
    }
    if (interaction.commandName === "clearleaderboard") {
      if (!interaction.user.id !== config.admin) {
        interaction.reply({ content: "/clearleaderboard - Access denied.", ephemeral: true});
        return;
      }
      fs.writeFileSync("./rank.json", "{}");
      interaction.reply("Reset successed!");
    }
    if (interaction.commandName === "rank") {
      const target = interaction.options.getMember("user");
      ranksort();
      //JSONを読み込む
      const db = JSON.parse(fs.readFileSync("./rank.json"));
      if (!target) {
        if (interaction.user.id in db) {
          //ユーザーIDのデータがある場合
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
        if (target.user.id in db) {
          // userIDのあるデータ
          const data = db[target.user.id];
          // そのデータの順位
          // とりあえず1とする
          let rank = 1;
          for (const id in db) {
            // 自分より得点が高い人がいたら、順位を下げる
            if (data.points < db[id].points) {
              rank += 1;
            }
          }
          interaction.reply({ content: `${target.user.tag} has ${data.points}points now and ${rank}th.`, ephemeral: true });
          return;
        } else {
          interaction.reply({ content: `${target.user.tag} has 0points now.`, ephemeral: true });
          return;
        }
      }
    }
    if (interaction.commandName === "cleartext") {
      if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        interaction.reply({ content: "/cleartext - Access Denied.", ephemeral: true });
        return;
      }
      // 指定されたメッセージの数を取
      const targetCount = interaction.options?.getInteger("lines") ?? 1;
      const time = Math.floor(Date.now() / 1000);
      // 指定された数のメッセージを取得
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const targetUser = await interaction.options.getUser("user");
      // 指定されたユーザーが発言したメッセージのみを抽出
      const collector = await messages.filter(msg => msg.author.id === targetUser.id);
      const msg = collector.first(targetCount)
      // それらのメッセージを一括削除
      interaction.channel.bulkDelete(msg);
      await interaction.reply({ content: `<t:${time}:T> ${targetCount} of ${targetUser.id}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`, ephemeral: false });
      return;
    }
    if (interaction.commandName === "forcecleartext") {
      if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
        interaction.reply({ content: "/forcecleartext - Access Denied.", ephemeral: true });
        return;
      }
      // 指定されたメッセージの数を取得
      const targetID = await interaction.options.getString("userid");
      const targetCount = interaction.options?.getInteger("lines") ?? 1;
      const time = Math.floor(Date.now() / 1000);
      const targetUser = await client.users.fetch(targetID);
      // 指定された数のメッセージを取得
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      // 指定されたユーザーが発言したメッセージのみを抽出
      const collector = await messages.filter(msg => msg.author.id == targetID);
      const msg = collector.first(targetCount)
      // それらのメッセージを一括削除
      interaction.channel.bulkDelete(msg);
      await interaction.reply({ content: `<t:${time}:T> ${targetCount} of ${targetUser.tag}'s messages were cleard from ${interaction.channel.name} by ${interaction.user.tag}.`, ephemeral: false });
      return;
    }
    if (interaction.commandName === "mute") {
      if (!interaction.memberPermissions.has("TIMEOUT_MEMBERS")) {
        return interaction.reply({ content: "/mute - Access denied.", ephemeral: true });
      }
      const target = interaction.options.getMember("user");
      if (target.user.id == interaction.user.id && target.user.id == interaction.guild.ownerId) {
        return interaction.reply({ content: "Error: You cannot mute user higer role have.", ephemeral: true });
      }
      const hour = interaction.options.getInteger("hours");
      const min = interaction.options.getInteger("minutes");
      const reasons = interaction.options.getString("reason");
      await target.timeout(hour * 60 * 60 * 1000 + min * 60 * 1000, `by ${interaction.user.tag}. reason: ${reasons}`);
      const time = Math.floor(Date.now() / 1000);
      if (hour === 0) {
        await interaction.reply({ content: `<t:${time}:T> ${target.user.tag} was muted for ${min}minutes by ${interaction.user.tag}. (${reasons})`, ephemeral: false });
      } else {
        await interaction.reply({ content: `<t:${time}:T> ${target.user.tag} was muted for ${hour}hours and ${min}minutes by ${interaction.user.tag}. (${reasons})`, ephemeral: false });
      }
    }
    if (interaction.commandName === "unmute") {
      if (interaction.memberPermissions.has("TIMEOUT_MEMBERS")) return interaction.reply({ content: "/unmute - Access denied.", ephemeral: true });
      const target = interaction.options.getMember("user");
      const reasons = interaction.options ?.getString("reason") ?? "none";
      const time = Math.floor(Date.now() / 1000);
      if (!reasons) {
        await target.timeout(null, `by ${interaction.user.name}`);
        await interaction.reply({ content: `<t:${time}:T> ${target.user.tag} was unmuted by ${interaction.user.name}`, ephemeral: false });
        return;
      }
      await target.timeout(null, (`by ${interaction.user.tag}. reason: ${reasons}`));
      await interaction.reply({ content: `<t:${time}:T> ${target.user.tag} was unmuted by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
    }
    if (interaction.commandName === "kick") {
      if (!interaction.memberPermissions.has('KICK_MEMBERS')) {
        interaction.reply({ content: "/kick - Access Denied.", ephemeral: true });
        return;
      }
      const targetMember = interaction.options.getMember("user");
      if (interaction.guild.ownerId !== interaction.user.id && targetMember.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
        return interaction.reply({ content: "Error: You cannot kick user higer role have.", ephemeral: true });
      }
      const how = interaction.options.getInteger("deletemsg");
      if (!how) {
        const messages = await interaction.channel.messages.fetch({ limit: how });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const mentionFilter = await messages.filter(msg => msg.author.id === targetMember.user.id);
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(mentionFilter);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.members.kick(targetMember, { days: day, reason: `by ${interaction.user.tag}. reason: ${reasons}` });
      const targetUser = await client.users.fetch(targetMember.user.id);
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${targetUser.tag} was kicked from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await targetUser.send(`<t:${time}:T> You (${targetUser.tag}) were kicked from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName === "ban") {
      if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
        interaction.reply({ content: "/ban - Access Denied.", ephemeral: true });
        return;
      }
      const targetMember = interaction.options.getMember("user");
      if (interaction.guild.ownerId !== interaction.user.id && targetMember.roles.highest.comparePositionTo(interaction.user.roles.highest) >= 0) {
        return interaction.reply({ content: "Error: You cannot BAN user higer role have.", ephemeral: true });
      }
      const targetCount = interaction.options?.getInteger("deletemsg");
      if (targetCount) {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const collector = await messages.filter(msg => msg.author.id == targetMember.user.id);
        const msg = collector.first(targetCount)
        // それらのメッセージを一括削除
        interaction.channel.bulkDelete(msg);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.bans.create(targetMember, { days: day, reason: `by ${interaction.user.tag}. reason: ${reasons}` });
      const targetUser = await client.users.fetch(targetMember.user.id);
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${targetMember.user.tag} was banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await targetUser.send(`<t:${time}:T> You (${targetUser.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName == "forceban") {
      if (interaction.user.id != config.admin) {
        interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
        return;
      }
      const targetID = interaction.options.getString("userid");
      const targetUser = await client.users.fetch(targetID);
      const targetCount = interaction.options?.getInteger("deletemsg");
      if (how) {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        // 指定されたユーザーが発言したメッセージのみを抽出
        const collector = await messages.filter(msg => msg.author.id == targetID);
        const msg = collector.first(targetCount)
        //それらのメッセージを一括削除
        interaction.channel.bulkDelete(msg);
      }
      const day = interaction.options.getInteger("days");
      const reasons = interaction.options.getString("reason");
      await interaction.guild.bans.create(targetUser, { days: day, reason: `by ${interaction.user.tag}. Force-BAN. reason: ${reasons}` });
      const time = Math.floor(Date.now() / 1000);
      await interaction.reply({ content: `<t:${time}:T> ${targetUser.tag} was force-banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
      await targetUser.send(`<t:${time}:T> You (${targetUser.tag}) were banned from ${interaction.guild.name} for ${day}days by ${interaction.user.tag}.(${reasons})`);
    }
    if (interaction.commandName === "unban") {
      if (!interaction.memberPermissions.has('BAN_MEMBERS')) {
        return interaction.reply({ content: "/forceban - Access Denied.", ephemeral: true });
      }
      const targetID = interaction.options.getString("userid");
      const targetUser = await client.users.fetch(targetID);
      const reasons = interaction.options ?.getString("reason") ?? "none";
      const time = Math.floor(Date.now() / 1000);
      await interaction.guild.bans.remove(targetUser, `by ${interaction.user.name}. reason: ${reasons}`);
      await interaction.reply({ content: `<t:${time}:T> ${targetUser.tag} was unbanned from ${interaction.guild.name} by ${interaction.user.tag}.(${reasons})`, ephemeral: false });
    }
  });

  function ranksort() {
    const db = JSON.parse(fs.readFileSync("./rank.json"));
    const obj = Object.entries(db);
    obj.sort((a, b) => b[1].points - a[1].points);
    const edit = JSON.stringify(Object.fromEntries(obj), null, 4);
    fs.writeFileSync("./rank.json", edit);
    return;
  }
};
