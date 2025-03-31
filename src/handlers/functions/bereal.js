const Discord = require('discord.js');
const Schema = require("../../database/models/bereal");
const axios = require('axios');

function isToday(timestamp) {
    const today = new Date();
    const date = new Date(timestamp * 1000);
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

module.exports = async (client) => {
    const checkApi = async () => {
        try {
            const response = await axios.get('https://mobile.bereal.com/api/relationships/timeslots');
            const data = response.data;

            const europeWestTimestamp = data.data.find(region => region.region === "europe-west")?.timestamp;
            if (!europeWestTimestamp) {
                console.error("Couldn't find europe-west timestamp");
                return;
            }

            const entries = await Schema.find({ Enabled: true });

            for (const entry of entries) {
                if (!entry.PostChannel || !entry.NotifChannel) continue;

                const postChannel = await client.channels.fetch(entry.PostChannel).catch(() => null);
                const notifChannel = await client.channels.fetch(entry.NotifChannel).catch(() => null);

                if (!postChannel || !notifChannel) {
                    console.error(`Channels not found for guild ${entry.Guild}`);
                    continue;
                }

                if (europeWestTimestamp !== entry.LastFiredOfficial && !isToday(entry.LastFiredLocal)) {
                    // Créer un nouveau thread pour le BeReal du jour
                    const thread = await postChannel.threads.create({
                        name: `BeReal du ${new Date().toLocaleDateString('fr-FR')}`,
                        autoArchiveDuration: 1440,
                        reason: 'Nouveau BeReal'
                    });

                    // Envoyer le message de notification
                    const notifEmbed = new Discord.EmbedBuilder()
                        .setTitle("🚨 C'est l'heure du BeReal ! 🚨")
                        .setDescription(`Vous avez ${entry.Timelimit} secondes pour poster votre BeReal dans ${thread} !`)
                        .setColor('#2f3136');

                    const notifMessage = await notifChannel.send({
                        content: "@everyone",
                        embeds: [notifEmbed]
                    });

                    // Mettre à jour les données
                    entry.LatestThread = thread.id;
                    entry.RecapMessages = [];
                    entry.Participants = [];

                    // Réinitialiser les streaks pour les utilisateurs qui n'ont pas participé
                    if (entry.stats && entry.stats.streaks) {
                        for (const [userId, streak] of entry.stats.streaks.entries()) {
                            const lastParticipation = entry.stats.lastParticipationDate.get(userId);
                            if (!lastParticipation || !isToday(lastParticipation / 1000)) {
                                entry.stats.streaks.set(userId, 0);
                            }
                        }
                    }

                    entry.LastFiredOfficial = europeWestTimestamp;
                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    entry.LastFiredLocal = currentTimestamp;
                    await entry.save();

                    // Programmer la suppression du message de notification
                    setTimeout(async () => {
                        try {
                            await notifMessage.delete();
                        } catch (error) {
                            console.error("Error deleting notification message:", error);
                        }
                    }, entry.Timelimit * 1000);

                    // Programmer l'envoi du récapitulatif
                    setTimeout(async () => {
                        try {
                            const updatedEntry = await Schema.findOne({ Guild: entry.Guild });
                            if (!updatedEntry) return;

                            const recapEmbed = new Discord.EmbedBuilder()
                                .setTitle("📸 Récapitulatif du BeReal")
                                .setDescription(`**${updatedEntry.Participants.length}** personnes ont participé aujourd'hui !`)
                                .setColor('#2f3136');

                            if (updatedEntry.Participants.length > 0) {
                                const participantsList = updatedEntry.Participants.map(id => `<@${id}>`).join('\n');
                                recapEmbed.addFields({ name: 'Participants', value: participantsList });
                            }

                            const thread = await postChannel.threads.fetch(updatedEntry.LatestThread);
                            if (thread) {
                                await thread.send({ embeds: [recapEmbed] });
                            }
                        } catch (error) {
                            console.error("Error sending recap:", error);
                        }
                    }, entry.Timelimit * 1000);
                }
            }
        } catch (error) {
            console.error("Error checking BeReal API:", error);
        }
    };

    // Vérifier l'API toutes les minutes
    setInterval(checkApi, 60000);

    // Gérer les messages avec images
    client.on('messageCreate', async (message) => {
        try {
            const entry = await Schema.findOne({ PostChannel: message.channel.id });
            if (!entry || !entry.Enabled) return;

            // Vérifier si le message contient une image
            if (message.attachments.size > 0) {
                // Vérifier si l'utilisateur n'a pas déjà posté
                if (!entry.Participants.includes(message.author.id)) {
                    // Initialiser les stats si elles n'existent pas
                    if (!entry.stats) {
                        entry.stats = {
                            totalParticipations: 0,
                            participationsPerUser: new Map(),
                            streaks: new Map(),
                            bestStreak: 0,
                            lastParticipationDate: new Map(),
                            averageResponseTime: 0,
                            totalBeReals: 0
                        };
                    }

                    // Calculer le temps de réponse
                    const responseTime = Math.floor(Date.now() / 1000) - entry.LastFiredLocal;
                    
                    // Mettre à jour les statistiques globales
                    entry.stats.totalParticipations += 1;
                    
                    // Mettre à jour les participations par utilisateur
                    const userParticipations = entry.stats.participationsPerUser.get(message.author.id) || 0;
                    entry.stats.participationsPerUser.set(message.author.id, userParticipations + 1);
                    
                    // Mettre à jour les streaks
                    const lastParticipation = entry.stats.lastParticipationDate.get(message.author.id);
                    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
                    const yesterday = today - 1;
                    
                    if (lastParticipation && Math.floor(lastParticipation / (1000 * 60 * 60 * 24)) === yesterday) {
                        const currentStreak = (entry.stats.streaks.get(message.author.id) || 0) + 1;
                        entry.stats.streaks.set(message.author.id, currentStreak);
                        entry.stats.bestStreak = Math.max(entry.stats.bestStreak, currentStreak);
                    } else {
                        entry.stats.streaks.set(message.author.id, 1);
                    }
                    
                    entry.stats.lastParticipationDate.set(message.author.id, Date.now());
                    
                    // Mettre à jour le temps de réponse moyen
                    const oldAvg = entry.stats.averageResponseTime || 0;
                    const totalBeReals = entry.stats.totalBeReals || 0;
                    entry.stats.averageResponseTime = (oldAvg * totalBeReals + responseTime) / (totalBeReals + 1);
                    entry.stats.totalBeReals += 1;

                    // Ajouter l'utilisateur aux participants
                    entry.Participants.push(message.author.id);
                    await entry.save();

                    // Réagir au message
                    await message.react('✅');

                    // Envoyer un message de confirmation
                    const embed = new Discord.EmbedBuilder()
                        .setDescription(`Merci ${message.author} ! Tu as posté ton BeReal en ${Math.floor(responseTime / 60)} minutes et ${responseTime % 60} secondes.`)
                        .setColor('#2f3136');

                    const thread = await message.channel.threads.fetch(entry.LatestThread);
                    if (thread) {
                        await thread.send({ embeds: [embed] });
                    }
                } else {
                    // L'utilisateur a déjà posté
                    await message.react('❌');
                    const embed = new Discord.EmbedBuilder()
                        .setDescription(`${message.author}, tu as déjà posté ton BeReal aujourd'hui !`)
                        .setColor('#ff0000');

                    const thread = await message.channel.threads.fetch(entry.LatestThread);
                    if (thread) {
                        const reply = await thread.send({ embeds: [embed] });
                        setTimeout(() => reply.delete().catch(() => {}), 5000);
                    }
                }
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
    });
};