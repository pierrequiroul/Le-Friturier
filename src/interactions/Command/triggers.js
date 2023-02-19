const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('triggers')
        .setDescription('Réponse automatique à un mot trigger basé sur un filtre Regex')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un trigger')
                .addStringOption(option => option.setName('nom').setDescription('Nom du trigger').setRequired(true))
                .addStringOption(option => option.setName('regex').setDescription('Filtre regex').setRequired(true))
                .addStringOption(option => option.setName('reponse').setDescription('Reponse du bot').setRequired(true))
                .addStringOption(option => option.setName('regex-flags').setDescription('Flags regex').setRequired(false))
                .addStringOption(option => option.setName('reply').setDescription('Répond au message (par defaut actif)')
                    .addChoices(
                        { name: 'Actif', value: 'true' },
                        { name: 'Inactif', value: 'false' },
                    ).setRequired(false))
                .addStringOption(option => option.setName('mention').setDescription('Mentionne le message (par defaut inactif)')
                    .addChoices(
                        { name: 'Actif', value: 'true' },
                        { name: 'Inactif', value: 'false' },
                    ).setRequired(false))
                .addStringOption(option => option.setName('status').setDescription('Activer ou désactiver ce trigger (par defaut actif)')
                    .addChoices(
                        { name: 'Actif', value: 'true' },
                        { name: 'Inactif', value: 'false' },
                    ).setRequired(false))
                .addStringOption(option => option.setName('deleting').setDescription('Supprimer le message original (par defaut inactif)')
                    .addChoices(
                        { name: 'Actif', value: 'true' },
                        { name: 'Inactif', value: 'false' },
                    ).setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Supprimer un trigger')
                .addStringOption(option => option.setName('nom').setDescription('Nom du trigger').setRequired(true))
        ),

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {
        const perms = await client.checkUserPerms({
            flags: [Permissions.FLAGS.MANAGE_MESSAGES],
            perms: ["MANAGE_MESSAGES"]
        }, interaction)

        if (!perms) return;

        client.loadSubcommands(client, interaction);
    },
};