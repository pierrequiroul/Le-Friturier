const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('triggers')
        .setDescription('Réponse automatique à un mot trigger basé sur un filtre Regex')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un trigger')
                .addStringOption(option => option.setName('nom').setDescription('Nom du déclencheur').setRequired(true))
                .addStringOption(option => option.setName('regex').setDescription('Filtre Regex').setRequired(true))
                .addStringOption(option => option.setName('response').setDescription('Réponse que le bot va renvoyer').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Supprimer un trigger')
                .addStringOption(option => option.setName('nom').setDescription('Nom du trigger').setRequired(true))
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

 