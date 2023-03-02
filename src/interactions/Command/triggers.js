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
                .addStringOption(option => option.setName('nom').setDescription('Nom du trigger').setRequired(true))
                .addStringOption(option => option.setName('type').setDescription('Type de trigger').setRequired(true)
                                 .addChoice('Répond au message', '1')
                                 .addChoice('Répond au message puis supprime', '2')
                                 .addChoice('Supprime', '3')
                                 .addChoice('Ajoute des réactions au message', '4')
                                )
                .addStringOption(option => option.setName('response').setDescription('Réponse du bot').setRequired(true))
                .addStringOption(option => option.setName('filter').setDescription('Filtre regex').setRequired(true))
                .addStringOption(option => option.setName('filterFlags').setDescription('Flags regex').setRequired(false))
                .addStringOption(option => option.setName('mention').setDescription('Mentionne le message par defaut inactif').setRequired(false))
                .addStringOption(option => option.setName('status').setDescription('Activer ou désactiver ce trigger par defaut actif').setRequired(false))
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

 