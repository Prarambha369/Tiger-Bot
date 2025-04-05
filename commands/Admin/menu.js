const { SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');
const menus = require('../../models/reactionRole');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Manage guild reaction role')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role menu')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the role menu')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a role menu')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the role menu')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a new role menu')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the role menu')
                        .setRequired(true))
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Mention the channel')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Add a role in a reaction role menu')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the role menu')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Mention the role')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Remove a role from a reaction role menu')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of the role menu')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Mention the role')
                        .setRequired(true))),
    permissions: ["MANAGE_GUILD", "MANAGE_ROLES"], // Corrected permission name

    async execute(interaction) {
        await interaction.reply({ content: `${interaction.client.user.username} is thinking...`, ephemeral: true });

        const option = interaction.options.getSubcommand(true).toLowerCase();
        const name = interaction.options.getString("name")?.toLowerCase()?.trim();
        const menu = await menus.findOne({ name, guild: interaction.guildId });
        const my_role = interaction.guild.me.roles.highest.position;
        const role = interaction.options.getRole("role");
        const channel = interaction.options.getChannel("channel");

        switch (option) {
            case "create":
                await handleCreate(interaction, menu, name);
                break;
            case "delete":
                await handleDelete(interaction, menu, name);
                break;
            case "start":
                await handleStart(interaction, menu, channel);
                break;
            case "add-role":
                await handleAddRole(interaction, menu, role, my_role);
                break;
            case "remove-role":
                await handleRemoveRole(interaction, menu, role);
                break;
            default:
                await interaction.editReply({ content: "Invalid subcommand" });
        }
    }
};

async function handleCreate(interaction, menu, name) {
    if (menu) {
        return interaction.editReply({ content: `A Reaction Role menu already exists with that name. Please use a different name.` });
    }

    await menus.create({ guild: interaction.guildId, name, roles: [], message: "0" }); // Initialize roles as an empty array
    interaction.editReply({ content: `Role menu created with name: \`${name}\`.` });
}

async function handleDelete(interaction, menu, name) {
    if (!menu) {
        return interaction.editReply({ content: `No Reaction Role menu exists with that name. Please provide a valid menu name.` });
    }

    await menus.findOneAndDelete({ guild: interaction.guildId, name });
    interaction.editReply({ content: `Role menu deleted with name: \`${name}\`.` });
}

async function handleStart(interaction, menu, channel) {
    if (channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_NEWS") {
        return interaction.editReply({ content: "Invalid channel was provided" });
    }
    if (!menu?.roles?.length) {
        return interaction.editReply({ content: "This menu has 0 roles." });
    }

    const { content, rows } = createMenuContentAndButtons(interaction, menu);

    const msg = await channel.send({ content, components: rows });

    await menus.findOneAndUpdate({ name: menu.name, guild: interaction.guildId }, { message: msg.id });

    interaction.editReply({ content: "Menu started successfully" });
}

function createMenuContentAndButtons(interaction, menu) {
    let content = `Reaction Menu : **${menu.name}**\n\nReact to get yourself a role\n\n`,
        rows = [new MessageActionRow()], index;

    menu.roles.forEach((v, i) => {
        content += `> ${interaction.guild.emojis.cache.get(v.emoji)?.toString() || v.emoji} : \`${interaction.guild.roles.cache.get(v.role).name}\`\n\n`;

        index = parseInt(i / 5);
        const button = new MessageButton({
            customId: `reaction_role_${i}`,
            style: "SECONDARY",
            emoji: v.emoji,
        });

        rows[index] ? rows[index].addComponents(button) : rows[index] = new MessageActionRow().addComponents(button);
    });

    return { content, rows };
}

async function handleAddRole(interaction, menu, role, my_role) {
    if (!menu) {
        return interaction.editReply({ content: `Reaction Role menu does not exist with that name. Please provide a valid menu name.` });
    }

    if (role.position >= my_role) {
        return interaction.editReply({ content: `The provided role is above my highest role. Please adjust the role hierarchy and try again.` });
    }

    const msg = await interaction.channel.send({ content: `React with the emoji you want for this role` });

    const reactions = await msg.awaitReactions({
        errors: ["time"],
        filter: (r, u) => u.id === interaction.user.id,
        max: 1,
        time: 300000
    }).catch(e => { });

    const emoji = reactions.first()?.emoji;

    if (!emoji) {
        return interaction.editReply({ content: "You took too much time to respond" });
    }

    if (isRoleOrEmojiInMenu(menu, role, emoji)) {
        return interaction.editReply({ content: `Reaction Role menu already has either the provided role or the emoji` });
    }

    menu.roles.push({ role: role.id, emoji: emoji.id || emoji.name });

    await menus.findOneAndUpdate({ name, guild: interaction.guildId }, { roles: menu.roles });

    interaction.editReply({ content: `Added role \`${role.name}\` with emoji: ${emoji.toString()} for menu: \`${menu.name}\`` });
    await msg.delete();
}

async function handleRemoveRole(interaction, menu, role) {
    if (!menu) {
        return interaction.editReply({ content: `Reaction Role menu does not exist with that name. Please provide a valid menu name.` });
    }

    if (!isRoleInMenu(menu, role)) {
        return interaction.editReply({ content: `Reaction Role menu does not have this role as part of it` });
    }

    menu.roles = menu.roles.filter((v) => v.role !== role.id);

    await menus.findOneAndUpdate({ name, guild: interaction.guildId }, { roles: menu.roles });

    interaction.editReply({ content: `Removed role \`${role.name}\` from menu: \`${menu.name}\`` });
}

function isRoleOrEmojiInMenu(menu, role, emoji) {
    return menu.roles.some(v => v.role === role.id) || menu.roles.some(v => v.emoji === emoji.id || v.emoji === emoji.name);
}

function isRoleInMenu(menu, role) {
    return menu.roles.some(v => v.role === role.id);
}
