const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bereal')
        .setDescription('Gérer les paramètres et configurations du système BeReal')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configurer les canaux et paramètres du BeReal')
                .addChannelOption(option => 
                    option.setName('postchannel')
                        .setDescription('Canal où les membres posteront leurs BeReal')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addChannelOption(option => 
                    option.setName('notifchannel')
                        .setDescription('Canal où seront envoyées les notifications de nouveau BeReal')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addIntegerOption(option => 
                    option.setName('timelimit')
                        .setDescription('Temps limite en secondes pour poster son BeReal (par défaut: 120)')
                )
                .addStringOption(option => 
                    option.setName('region')
                        .setDescription('Région pour la synchronisation (par défaut: europe-west)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('enabled')
                .setDescription('Activer ou désactiver le système BeReal')
                .addBooleanOption(option => 
                    option.setName('enabled')
                        .setDescription('true = activer, false = désactiver')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('force')
                .setDescription('Forcer le déclenchement d\'un nouveau BeReal')
                .addBooleanOption(option => 
                    option.setName('override')
                        .setDescription('Ignorer la vérification de temps depuis le dernier BeReal')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Afficher la configuration actuelle et les statistiques du BeReal')
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