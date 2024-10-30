const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bereal')
        .setDescription('Manage the BeReal setups')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('setup')
                .addChannelOption(option => option.setName('postchannel').setDescription('postchannel').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addChannelOption(option => option.setName('notifchannel').setDescription('notifchannel').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addIntegerOption(option => option.setName('timelimit').setDescription('timelimit'))
                .addStringOption(option => option.setName('region').setDescription('region'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('enabled')
                .setDescription('status')
                .addBooleanOption(option => option.setName('enabled').setDescription('enabled').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('force')
                .setDescription('force notif')
                .addBooleanOption(option => option.setName('override').setDescription('override'))
        )
    ,

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        const perms = await client.checkUserPerms({
            flags: [Discord.PermissionsBitField.Flags.Administrator],
            perms: [Discord.PermissionsBitField.Flags.Administrator]
        }, interaction)

        if (perms == false) return;

        client.loadSubcommands(client, interaction, args);
    },
};

 