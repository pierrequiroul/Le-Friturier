const Discord = require('discord.js');
const voiceRoles = require("../../database/models/voiceRoles");
const chalk = require('chalk');
const fullLog = false;

module.exports = async (client, oldState, newState) => {

    const member = newState.member || oldState.member;
    if (!member || member.user?.bot) {
        if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Ignoré (bot ou membre non trouvé)`));
        return;
    }

    const guildId = newState.guild?.id || oldState.guild?.id;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Serveur introuvable`));
        return;
    }

    const botMember = await guild.members.fetchMe();
    const botPermissions = botMember.permissions;
    if (!botPermissions.has(Discord.PermissionsBitField.Flags.ManageRoles) || !botPermissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
        if (fullLog) console.error(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Le bot n'a pas la permission 'Gérer les rôles'`));
        return;
    }

    // Quand un membre rejoint un salon vocal
    if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
        if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Membre rejoint le salon: ${newState.channelId}`));

        try {
            // Vérifier si le salon a un rôle associé
            let voiceRoleData = await voiceRoles.findOne({ 
                Guild: guildId, 
                VoiceChannel: newState.channelId 
            });
            if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Données de la base de données:`), voiceRoleData);

            // Si aucun rôle n'est associé, en créer un automatiquement
            if (!voiceRoleData) {
                const channel = guild.channels.cache.get(newState.channelId);
                if (!channel) {
                    if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Salon vocal introuvable`));
                    return;
                }

                // Créer un rôle avec le même nom que le salon vocal
                const roleName = channel.name.slice(0, 100);
                const role = await guild.roles.create({
                    name: roleName,
                    color: 'Blue',
                    reason: 'Rôle automatique pour salon vocal'
                });
                console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Rôle créé: ${role.name}`));

                // Sauvegarder dans la base de données
                voiceRoleData = await new voiceRoles({
                    Guild: guildId,
                    VoiceChannel: newState.channelId,
                    Role: role.id,
                    FriendlyName: roleName
                }).save();
                if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Rôle enregistré dans la base de données`));
            }

            // Attribuer le rôle à l'utilisateur
            const role = guild.roles.cache.get(voiceRoleData.Role);
            if (role) {
                await newState.member.roles.add(role);
                if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Rôle attribué: ${role.name} à ${newState.member.user.tag}`));
            } else {
                console.error(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Rôle introuvable dans le serveur`));
            }
        } catch (error) {
            console.error(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Erreur:`), error);
        }
    }

    // Quand un membre quitte un salon vocal (logique existante)
    if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
        try {
            const voiceRoleData = await voiceRoles.findOne({ 
                Guild: guildId, 
                VoiceChannel: oldState.channelId 
            });

            if (voiceRoleData) {
                const role = guild.roles.cache.get(voiceRoleData.Role);
                if (role) {
                    await oldState.member.roles.remove(role);
                    if (fullLog) console.log(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.green(`Rôle ${role.name} retiré de ${oldState.member.user.tag}`));
                }
            }
        } catch (error) {
            console.error(chalk.blue(chalk.bold(`Voice Roles`)), (chalk.white(`>>`)), chalk.red(`Erreur lors du retrait du rôle:`), error);
        }
    }
};