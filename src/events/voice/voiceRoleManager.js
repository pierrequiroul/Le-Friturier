const Discord = require('discord.js');
const voiceRoles = require("../../database/models/voiceRoles");

module.exports = async (client, oldState, newState) => {
    // Ignorer les bots
    if (oldState.member.user.bot || newState.member.user.bot) return;

    const guildId = newState.guild.id || oldState.guild.id;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    // Quand un membre rejoint un salon vocal
    if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
        try {
            // Vérifier si le salon a un rôle associé
            const voiceRoleData = await voiceRoles.findOne({ 
                Guild: guildId, 
                VoiceChannel: newState.channelId 
            });

            if (voiceRoleData) {
                const role = guild.roles.cache.get(voiceRoleData.Role);
                if (role) {
                    await newState.member.roles.add(role);
                    console.log(`[Voice Roles] Rôle ${role.name} ajouté à ${newState.member.user.tag}`);
                }
            }
        } catch (error) {
            console.error("[Voice Roles] Erreur lors de l'ajout du rôle:", error);
        }
    }

    // Quand un membre quitte un salon vocal
    if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
        try {
            // Vérifier si le salon avait un rôle associé
            const voiceRoleData = await voiceRoles.findOne({ 
                Guild: guildId, 
                VoiceChannel: oldState.channelId 
            });

            if (voiceRoleData) {
                const role = guild.roles.cache.get(voiceRoleData.Role);
                if (role) {
                    await oldState.member.roles.remove(role);
                    console.log(`[Voice Roles] Rôle ${role.name} retiré de ${oldState.member.user.tag}`);
                }
            }
        } catch (error) {
            console.error("[Voice Roles] Erreur lors du retrait du rôle:", error);
        }
    }
};