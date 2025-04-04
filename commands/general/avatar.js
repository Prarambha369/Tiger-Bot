
  const { MessageAttachment, TextChannel, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: "avatar",
        description: "Check your or users avatar",
        options: [{
            name: "user",
            description: "Mention a user",
            required: false,
            type: 6,
        }],
    },

    run: async (client, interaction) => {

        const user = interaction.options.getUser("user") || interaction.user;     
      const AvatarButtons = new MessageActionRow()
 .addComponents(
 new MessageButton()
 .setLabel('PNG')
 .setURL(interaction.user.displayAvatarURL({ size: 4096, dynamic: true, format: "png"}), true)
 .setStyle('LINK'),
 new MessageButton()
 .setLabel('JPG')
 .setURL(interaction.user.displayAvatarURL({ size: 4096, dynamic: true, format: "jpg"}), true)
 .setStyle("LINK"),
 new MessageButton()
 .setLabel('WEBP')
 .setURL(interaction.user.displayAvatarURL({ size: 4096, dynamic: true, format: "webp"}), true)
 .setStyle("LINK")
 );
 

 let embed = new MessageEmbed()
 .setAuthor(`${user.username}'s Avatar`, interaction.user.displayAvatarURL())

 .addField('PNG', `\n[\`LINK\`](${user.displayAvatarURL({ size: 4096, dynamic: true, format: "png" })})`, true, true)
 .addField('JPG', `\n[\`LINK\`](${user.displayAvatarURL({ size: 4096, dynamic: true, format: "jpg" })})`, true, true)
 .addField('WEBP', `\n[\`LINK\`](${user.displayAvatarURL({ size: 4096, dynamic: true, format: "webp" })})`, true, true)

 .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }))
 .setThumbnail(interaction.guild.iconURL())
 .setColor('RANDOM')
 .setTimestamp()
 interaction.reply({ embeds: [embed], components:[AvatarButtons] })
    }
}