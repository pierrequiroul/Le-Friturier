const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Discord = require('discord.js');
/*async function getAlias() {
    var datas = await Schema.find({ Guild: interaction.guild.id });
    if (datas.length > 0) {
        datas = datas[0].Triggers;
        var list = []; // Create an array to store the objects

        for (var i = 0; i < datas.length; i++) {
            list.push({ name: datas[i].alias, value: datas[i].alias }); // Push objects to the array
        }
    }
    return list;
}*/
module.exports = {
    data: new SlashCommandBuilder()
        .setName('triggers')
        .setDescription('Déclenche une réponse à certains mots')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un trigger')
                .addStringOption(option => option.setName('alias').setDescription('Alias du trigger').setRequired(true))
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('Type de réponse')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Répond', value: '1' },
                            { name: 'Répond puis supprime', value: '2' },
                            { name: 'Répond et ajoute une réaction', value: '5'},
                            { name: 'Ajoute une réaction', value: '4' },
                            { name: 'Supprime', value: '3' }
                        )
                )
                .addStringOption(option => option.setName('regex').setDescription('Filtre regex').setRequired(true))
                .addStringOption(option => option.setName('regexflags').setDescription('Flags regex additionnels').setRequired(true))
                .addStringOption(option => option.setName('response').setDescription('Message de réponse du bot. Si plusieurs, séparez par ;;').setRequired(false))
                .addStringOption(option => 
                    option.setName('responsestype')
                        .setDescription('Manière dont sont jouées les réponses (si multiples)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'En séquence', value: "true" },
                            { name: 'Aléatoire', value: "false" }
                        )
                )
                .addStringOption(option => 
                    option.setName('isactive')
                        .setDescription('Status du trigger')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Activé (par défaut)', value: "true" },
                            { name: 'Désactivé', value: "false" }
                        )
                )
                .addStringOption(option => 
                    option.setName('mention')
                        .setDescription('Mentionne lors de la réponse')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Mentionne (par défaut)', value: "true" },
                            { name: 'Ne mentionne pas', value: "false" }
                        )
                )
                .addStringOption(option => 
                    option.setName('replied')
                        .setDescription('Manière dont est affiché la réponse')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Message suivi (par défaut)', value: "true" },
                            { name: 'Message seul', value: "false" }
                        )
                )
                .addStringOption(option => option.setName('emotes').setDescription('Emotes ajoutées lors de la réaction').setRequired(false))
                .addNumberOption(option => option.setName('timedeletion').setDescription('Temps avant suppression (par défaut 1000ms si option active)').setRequired(false))
                .addUserOption(option => option.setName('target').setDescription('Ne se déclenchera uniquement pour cet utilisateur. Par défaut: tout le monde').setRequired(false))
                .addStringOption(option => 
                    option.setName('targetmode')
                        .setDescription('Status de la target')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Uniquement la target (par défaut)', value: "true" },
                            { name: 'Tout le monde sauf la target', value: "false" }
                        )
                )
                .addChannelOption(option => option.setName('salon').setDescription('Ne se déclenchera uniquement dans ce salon. Par défaut: tous les salons').setRequired(false))
                .addIntegerOption(option => option.setName('cooldown').setDescription('Cooldown en millisecondes (Par défaut 0)').setRequired(false))
            )
            .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retirer un trigger')
                .addStringOption(option => option.setName('alias').setDescription('Alias du trigger').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('zer')
                .addStringOption(option => 
                    option.setName('alias')
                        .setDescription('Alias')
                        .setRequired(true)
                        .setAutocomplete(true))
                        
                )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Voir tous les triggers')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('documentation')
                .setDescription('Documentation sur comment faire un triggers')
        ),
        /*async autocomplete(interaction) {
            const value = interaction.options.getFocused().toLowerCase();
            const guild = await interaction.client.guilds.fetch()

            let choices = ["coffee", "table"];
            await guilds.forEach(async guild => {
                choices.push(guild.name);
            })

            const filtered = choices.filter(choice => choice.toLowerCase().includes(value)).slice(0, 25);
        
            if(!interaction) return;

            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice}))
            );
        },*/

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        const perms = await client.checkUserPerms({
            flags: [Discord.PermissionsBitField.Flags.ManageMessages],
            perms: [Discord.PermissionsBitField.Flags.ManageMessages]
        }, interaction)

        if (perms == false) return;
        client.loadSubcommands(client, interaction, args);
    },
};

 