const { find } = require('node-emoji');
const polls = require("../../models/polls")
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    data: {
        name: "poll",
        description: "Manage polls of your server",
        options: [{
            name: "create",
            type: 1,
            description: "Create a poll",
            options: [{
                name: "question",
                type: 3,
                required: true,
                description: "The question of the poll"
            }, {
                name: "channel",
                type: 7,
                required: true,
                description: "The channel where you want create the poll"
            }, {
                name: "options",
                type: 3,
                required: true,
                description: "The choices of this poll, seprate them by |",
            }, {
                name: "custom-emojis",
                type: 3,
                required: false,
                description: "Custom emojis for the chocies, seprate them by |"
            }]
        }, {
            name: "end",
            type: 1,
            description: "End a poll",
            options: [{
                name: "id",
                type: 3,
                required: true,
                description: "Message ID of the poll"
            }]
        }],
    },
    timeout: 5000,
    permissions: ["MANAGE_GUILD"],

    run: async (client, interaction) => {
        await interaction.deferReply();

        const option = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel("channel");
        const rawOptions = interaction.options.getString("options");
        const cEmojis = interaction.options.getString("custom-emojis") || "";
        const id = interaction.options.getString("id");
        const question = interaction.options.getString("question");
        const poll = await polls.findOne({ message: id });

        if (option === "create") {
            await handleCreatePoll({ client, interaction, channel, rawOptions, cEmojis, question });
        } else if (option === "end") {
            await handleEndPoll(interaction, poll, id);
        }
    }
}

async function handleCreatePoll(params) {
    const { client, interaction, channel, rawOptions, cEmojis, question } = params;
    let _emoji = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"];
    let emojis = [];

    const options = parseOptions(rawOptions, cEmojis);
    if (!validateOptions(options.rawOptions)) {
        return sendInvalidOptionsReply(interaction);
    }

    const rows = createMessageActionRows({ client, rawOptions: options.rawOptions, cEmojis: options.cEmojis, _emoji, emojis });

    try {
        const v = await sendPollMessage({ channel, question, rawOptions: options.rawOptions, cEmojis: options.cEmojis, rows });
        await savePollToDatabase({ question, messageId: v.id, channelId: channel.id, guildId: interaction.guildId, emojis });
        sendPollCreatedReply(interaction, v.url);
    } catch (e) {
        sendPollCreationErrorReply(interaction);
    }
}

function parseOptions(rawOptions, cEmojis) {
    return {
        rawOptions: rawOptions.split("|"),
        cEmojis: cEmojis?.trim()?.replace(/ +/g, "")?.split("|")
    };
}

function validateOptions(rawOptions) {
    return rawOptions.length >= 2 && rawOptions.length <= 25;
}

function sendInvalidOptionsReply(interaction) {
    return interaction.editReply({
        embeds: [{
            color: "RED",
            title: "❌ Invalid Options",
            description: "You need at least 2 options and a maximum of 25 options, You need to separate options via `|`"
        }]
    });
}

function createMessageActionRows({ client, rawOptions, cEmojis, _emoji, emojis }) {
    const rows = [new MessageActionRow()];
    for (let i = 0; i < rawOptions.length; i++) {
        let ind = Math.floor(i / 5);
        emojis.push(fixEmoji(client, cEmojis[i]) || _emoji[i]);

        const button = new MessageButton({
            customId: emojis[i],
            emoji: emojis[i],
            label: "0",
            style: "SECONDARY"
        });

        rows[ind] ? rows[ind].addComponents(button) : rows[ind] = new MessageActionRow({
            components: [button]
        });
    }
    return rows;
}

async function sendPollMessage({ channel, question, rawOptions, cEmojis, rows }) {
    return await channel.send({
        embeds: [{
            color: "BLUE",
            title: question.slice(0, 256),
            description: rawOptions.map((v, i) => `${cEmojis[i] || emojis[i]} ${v}`).join("\n"),
            timestamp: Date.now(),
            footer: {
                text: `Poll Started At`
            }
        }],
        components: rows
    });
}

async function savePollToDatabase({ question, messageId, channelId, guildId, emojis }) {
    await polls.create({
        question,
        message: messageId,
        channel: channelId,
        guild: guildId,
        votes: {},
        voters: [],
        emojis
    });
}

function sendPollCreatedReply(interaction, url) {
    interaction.editReply({
        embeds: [{
            color: "GREEN",
            title: "✅ Poll Created",
            description: `Check the poll [here](${url})`
        }]
    });
}

function sendPollCreationErrorReply(interaction) {
    interaction.editReply({
        embeds: [{
            color: "RED",
            title: "❌ Unable To Create The Poll",
        }]
    });
}

async function handleEndPoll(interaction, poll, id) {
    if (!poll) {
        return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ Invalid Poll Message ID",
            }]
        });
    }

    if (poll.ended) {
        return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ Poll is already Ended",
            }]
        });
    }

    const msg = await interaction.guild.channels.cache.get(poll.channel).messages.fetch(id);

    if (!msg) {
        return interaction.editReply({
            embeds: [{
                color: "RED",
                title: "❌ Poll Not Endable",
                description: `Poll message is deleted, So it is no longer endable`
            }]
        });
    }

    const opt = msg.embeds[0].description?.split("\n");
    const x = Object.entries(poll.votes)?.sort((a, b) => b[1] - a[1]);
    let winner = opt.filter(v => v.includes(x[0][0]));

    interaction.editReply({
        embeds: [{
            color: "GREEN",
            title: "Poll Ended"
        }]
    });

    msg.edit({
        components: [],
        embeds: [{
            title: msg.embeds[0].title,
            color: "RED",
            description: `**Poll ended**\nThe most voted option got ${x[0][1]} votes and it was:\n${winner}`,
            timestamp: Date.now(),
            footer: {
                text: `Poll Ended At`
            }
        }]
    });

    await polls.findOneAndUpdate({ message: id }, { ended: true });
}

function fixEmoji(client, emj = "") {
    const e = find(emj)?.emoji;
    const e2 = client.emojis.cache.find(v => v.toString() === emj);

    return e2?.id || e;
}

