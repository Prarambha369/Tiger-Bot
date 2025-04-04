const { MessageAttachment } = require('discord.js');


module.exports = async (client) => {
    console.log("Client is up");

    
    client.application.commands.set([...client.commands.map(v => v.data)]);

    
}