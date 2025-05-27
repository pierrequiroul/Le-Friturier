const Discord = require('discord.js');
const voiceRoles = require("../../database/models/voiceRoles");
const chalk = require('chalk');

module.exports = async (client) => {
    console.log(chalk.blue(chalk.bold(`Voice Cleanup`)), (chalk.white(`>>`)), chalk.green(`Lancement de la vérification...`));

    try {
        // Attendre que tous les shards soient prêts
        await client.shard.fetchClientValues('guilds.cache.size');
        
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const voiceRoleEntries = await voiceRoles.find({ Guild: guildId });
                if (!voiceRoleEntries.length) continue;

                for (const entry of voiceRoleEntries) {
                    const voiceChannel = guild.channels.cache.get(entry.VoiceChannel);
                    const role = guild.roles.cache.get(entry.Role);

                    if (!voiceChannel || !role) {
                        await voiceRoles.deleteOne({ _id: entry._id });
                        continue;
                    }

                    // Récupération sécurisée des membres
                    let members;
                    try {
                        members = await guild.members.fetch({ force: false }); // Utilise le cache si possible
                    } catch (error) {
                        console.error(chalk.blue(chalk.bold(`Voice Cleanup`)), (chalk.white(`>>`)), chalk.red(`Erreur fetchMembers pour ${guildId}:`), error.message);
                        continue;
                    }

                    // Vérification des membres
                    const membersInVoice = voiceChannel.members;
                    members.forEach((member) => {
                        const hasRole = member.roles.cache.has(role.id);
                        const isInVoice = membersInVoice.has(member.id);

                        if (isInVoice && !hasRole) {
                            member.roles.add(role).catch(console.error);
                        } else if (!isInVoice && hasRole) {
                            member.roles.remove(role).catch(console.error);
                        }
                    });
                }
            } catch (guildError) {
                console.error(chalk.blue(chalk.bold(`Voice Cleanup`)), (chalk.white(`>>`)), chalk.red(`Erreur sur le serveur ${guildId}:`), guildError.message);
            }
        }
    } catch (globalError) {
        console.error(chalk.blue(chalk.bold(`Voice Cleanup`)), (chalk.white(`>>`)), chalk.red(`Erreur globale:`), globalError.message);
    }
};