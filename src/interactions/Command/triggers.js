const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('triggers')
        .setDescription('Manage the blacklist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('display')
                .setDescription('')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('')
                .addStringOption(option => option.setName('nom').setDescription('').setRequired(true))
                .addStringOption(option => option.setName('regex').setDescription('').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('')
                .addStringOption(option => option.setName('nom').setDescription('').setRequired(true))
        )
    ,

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        const perms = await client.checkUserPerms({
            flags: [Discord.Permissions.FLAGS.MANAGE_MESSAGES],
            perms: ["MANAGE_MESSAGES"]
        }, interaction)

        if (perms == false) return;

        client.loadSubcommands(client, interaction, args);
    },
};

 