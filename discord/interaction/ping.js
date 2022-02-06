module.exports = async interaction => {
  const now = Date.now();
  const msg = [
    "pong!",
    "",
    `gateway: ${interaction.client.ws.ping}ms`,
  ];
  await interaction.reply({ content: msg.join("\n"), ephemeral: true });
  await interaction.editReply([...msg, `往復: ${Date.now() - now}ms`].join("\n"));
}
