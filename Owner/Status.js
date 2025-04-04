npm  install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-devconst { Client } = require("discord.js");

module.exports = {
    data: {
        name: "Owner",
        description: "Change the status of Tiger Bot!",
        options: [{
            name: "status",
            description: "the new status of Tiger Bot!",
            required: true,
            type: "STRING",
        }],
    },

    /**
     * 
     * @param {Client} client 
     * @param {*} interaction 
     * @returns 
     */
    run: async (client, interaction,args) => {
        if (!client.owners.includes(interaction.user.id)) return interaction.reply({ content: `You are not a owner` });

        client.user.setActivity({
            name: interaction.options.getString("status", true),
            type: "PLAYING"
        });

        interaction.reply({ content: `Status changed to  : ${interaction.options.getString("status")}` });
    }
  }