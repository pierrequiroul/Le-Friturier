const Discord = require('discord.js');
const voiceRoles = require("../../database/models/voiceRoles");

module.exports = async (client, interaction, args) => {
    // Vérifier les permissions
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageRoles)) {
        return client.errNormal({ 
            error: "Vous n'avez pas la permission de gérer les rôles!", 
            type: 'editreply' 
        }, interaction);
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "setup") {
        const channel = interaction.options.getChannel('channel');
        
        // Vérifier que c'est un salon vocal
        if (channel.type !== Discord.ChannelType.GuildVoice) {
            return client.errNormal({ 
                error: "Le salon sélectionné doit être un salon vocal!", 
                type: 'editreply' 
            }, interaction);
        }

        // Créer un rôle avec le même nom que le salon
        const role = await interaction.guild.roles.create({
            name: `🔊 ${channel.name}`,
            color: 'Blue',
            reason: 'Rôle automatique pour salon vocal'
        });

        // Sauvegarder dans la base de données
        await voiceRoles.findOne({ Guild: interaction.guild.id, VoiceChannel: channel.id }, async (err, data) => {
            if (data) {
                data.Role = role.id;
                data.save();
            } else {
                new voiceRoles({
                    Guild: interaction.guild.id,
                    VoiceChannel: channel.id,
                    Role: role.id
                }).save();
            }
        });

        client.succNormal({
            text: `Configuration des rôles vocaux réussie!`,
            fields: [
                {
                    name: `📘┆Salon`,
                    value: `${channel} (${channel.id})`
                },
                {
                    name: `📘┆Rôle`,
                    value: `${role} (${role.id})`
                }
            ],
            type: 'editreply'
        }, interaction);
    } else if (subcommand === "setupall") {
        // Récupérer tous les salons vocaux
        const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildVoice);
        
        if (voiceChannels.size === 0) {
            return client.errNormal({ 
                error: "Aucun salon vocal trouvé dans ce serveur!", 
                type: 'editreply' 
            }, interaction);
        }

        let setupCount = 0;
        
        // Créer un message de chargement
        await client.simpleEmbed({
            text: `Configuration en cours pour ${voiceChannels.size} salons vocaux...`,
            type: 'editreply'
        }, interaction);

        // Pour chaque salon vocal, créer un rôle et l'associer
        for (const [id, channel] of voiceChannels) {
            try {
                // Vérifier si une configuration existe déjà
                const existingConfig = await voiceRoles.findOne({ Guild: interaction.guild.id, VoiceChannel: id });
                if (existingConfig) continue;

                // Créer un rôle avec le même nom que le salon
                const role = await interaction.guild.roles.create({
                    name: `🔊 ${channel.name}`,
                    color: 'Blue',
                    reason: 'Rôle automatique pour salon vocal'
                });

                // Sauvegarder dans la base de données
                await new voiceRoles({
                    Guild: interaction.guild.id,
                    VoiceChannel: id,
                    Role: role.id
                }).save();

                setupCount++;
            } catch (error) {
                console.error(`Erreur lors de la configuration du salon ${channel.name}:`, error);
            }
        }

        client.succNormal({
            text: `Configuration des rôles vocaux terminée!`,
            fields: [
                {
                    name: `📊┆Salons configurés`,
                    value: `${setupCount}/${voiceChannels.size}`
                }
            ],
            type: 'editreply'
        }, interaction);
    }
}