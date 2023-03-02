const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anniversaire')
        .setDescription('Voir ou ajouter ta date d anniversaire')
        .addSubcommand(subcommand =>
            subcommand
                .setName('supprimer')
                .setDescription('Supprime ta date d anniversaire)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Voir la liste des anniversaires du serveur')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Ajouter ta date d anniversaire)
                .addNumberOption(option => option.setName('jour').setDescription('Le chiffre du jour').setRequired(true))
                .addNumberOption(option => option.setName('mois').setDescription('Le chiffre du mois').setRequired(true))
        )
    ,

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        client.loadSubcommands(client, interaction, args);
    },
};

 