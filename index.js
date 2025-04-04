require("http").createServer((_, res) => res.end('Bot Online')).listen(8080)
const Discord = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', true); // Added to suppress the Mongoose warning
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

const client = new Discord.Client({
    intents: 131071
});

client.owners = [process.env.OWNER_ID];

client.commands = new Discord.Collection();
client.categories = readdirSync(join(__dirname, "./Src/commands"));

readdirSync(join(__dirname, "./Src/events")).forEach(file =>
    client.on(file.split(".")[0], (...args) => require(`./Src/events/${file}`)(client, ...args))
);

for (let i = 0; i < client.categories.length; i++) {
    const commands = readdirSync(join(__dirname, `./Src/commands/${client.categories[i]}`)).filter(file => file.endsWith(".js"));

    for (let j = 0; j < commands.length; j++) {
        const command = require(`./Src/commands/${client.categories[i]}/${commands[j]}`);
        if (!command || !command?.data?.name || typeof (command?.run) !== "function") continue;
        command.category = client.categories[i];
        client.commands.set(command.data.name, command);
    }
}

const { GiveawaysManager } = require("discord-giveaways");
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "Src/storage/giveaways.json",
    default: {
        botsCanWin: false,
        embedColor: "#2F3136",
        reaction: "🎉",
        lastChance: {
            enabled: true,
            content: `🚨 **Last chance to enter** 🚨`,
            threshold: 5000,
            embedColor: '#FF0000'
        }
    }
});

client.on('ready', () => {
    console.log('Tiger Bot Online "NextEra on Top!"')
});

process.on("unhandledRejection", (reason, p) => {
    console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [Error_Handling] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    console.log(" [Error_Handling] :: Multiple Resolves");
    console.log(type, promise, reason);
});

client.login(process.env.TOKEN);
