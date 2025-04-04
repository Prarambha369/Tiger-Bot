module.exports = (client, interaction) => {
  if (!interaction.isCommand() && !interaction.isContextMenu()) return;

  try {
    client.commands.get(interaction.commandName)?.run(client, interaction);
  } catch (e) {
    console.log(e);
    interaction.reply({content: "SOMETHING WENT WRONG "});
  }
}