// Importer les dépendances
const { ChannelType, ThreadAutoArchiveDuration } = require('discord.js');
const fetch = require('node-fetch');
const Schema = require('../../database/models/bereal');

module.exports = (client) => {
    // Fonction pour vérifier si une date est aujourd'hui
    function isToday(timestamp) {
        const date = new Date(timestamp * 1000);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Fonction principale pour vérifier l'API
    async function checkApi() {
        try {
            // Faire une requête GET à l'API
            const response = await fetch(`https://bereal.devin.rest/v1/moments/latest?api_key=${process.env.BEREAL_API}`);
            const data = await response.json();

            // Extraire le timestamp de la région europe-west
            const europeWestTimestamp = data.regions['europe-west'].ts;

            // Récupérer toutes les entrées de la collection
            const dbEntries = await Schema.find();

            // Pour chaque entrée, comparer et mettre à jour si nécessaire
            dbEntries.forEach(async (entry) => {
                if (entry.Enabled) {
                    if (europeWestTimestamp !== entry.LastFiredOfficial && !isToday(entry.LastFiredLocal)) {
                        console.log(`Changement détecté pour la guilde ${entry.Guild} dans la région europe-west !`);
                        // Supprimer le recap message précédent dans le postChannel
                        if (entry.RecapMessages && entry.RecapMessages.length > 0) {
                            const postChannel = await client.channels.fetch(entry.PostChannel);
                            if (postChannel) {
                                const recapMessageId = entry.RecapMessages[0];
                                try {
                                    const recapMessage = await postChannel.messages.fetch(recapMessageId);
                                    if (recapMessage) {
                                        await recapMessage.delete();
                                    }
                                } catch (error) {
                                    console.error(`Erreur lors de la suppression du recap message : ${error}`);
                                }
                            }
                        }
                        // Réinitialiser RecapMessages et Participants
                        entry.RecapMessages = [];
                        entry.Participants = [];
                        entry.LastFiredOfficial = europeWestTimestamp;
                        const currentTimestamp = Math.floor(Date.now() / 1000);
                        entry.LastFiredLocal = currentTimestamp;
                        await entry.save();

                        // Lancer la notification
                        await launchNotification(entry.Guild);
                    } else {
                        if (europeWestTimestamp !== entry.LastFiredOfficial) {
                            console.log(`Changement détecté pour ${entry.Guild} mais la notif a déjà été envoyée aujourd'hui.`);
                        } else {
                            console.log(`Aucun changement détecté pour la guilde ${entry.Guild}.`);
                        }
                    }
                } else {
                    console.log(`Les notifications sont désactivées pour la guilde ${entry.Guild}.`);
                }
            });
        } catch (error) {
            console.error("Erreur lors de la vérification de l'API:", error);
        }
    }

    // Fonction pour lancer une notification
    async function launchNotification(guildId) {
        try {
            // Récupérer l'entrée de la base de données pour la guilde
            const entry = await Schema.findOne({ Guild: guildId });

            // Calculer le timestamp de fin
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const endTimestamp = currentTimestamp + entry.Timelimit;
            const countdown = `<t:${endTimestamp}:R>`;

            if (entry && entry.PostChannel) {
                const postChannel = await client.channels.fetch(entry.PostChannel);
                if (postChannel) {
                    // Envoyer le premier recap message dans le postChannel
                    const recapMessageContent = "Récapitulatif des participants : Aucun participant pour l'instant.";
                    const postChannelRecapMessage = await postChannel.send(recapMessageContent);
                    entry.RecapMessages.push(postChannelRecapMessage.id);
                    await entry.save();

                    // Créer un thread privé dans le canal de publication
                    let threadName = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
                    let threadExists = true;
                    let count = 1;
                    while (threadExists) {
                        const existingThreads = await postChannel.threads.fetchActive();
                        threadExists = existingThreads.threads.some(thread => thread.name === threadName);
                        if (threadExists) {
                            count++;
                            threadName = `${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} - #${count}`;
                        }
                    }
                    const thread = await postChannel.threads.create({
                        name: threadName,
                        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay, // 24 heures
                        type: ChannelType.PrivateThread,
                        reason: 'Mise à jour région détectée'
                    });
                    if (thread) {
                        // Envoyer le deuxième recap message dans le thread privé
                        const threadRecapMessage = await thread.send(recapMessageContent);
                        entry.RecapMessages.push(threadRecapMessage.id);
                        await entry.save();
                        // Sauvegarder l'ID du thread dans la base de données
                        entry.LatestThread = thread.id;
                        await entry.save();
                    }
                } else {
                    console.error(`Impossible de trouver le canal pour la guilde ${guildId}.`);
                }
            } else {
                console.error(`Aucune entrée trouvée ou canal de publication non défini pour la guilde ${guildId}.`);
            }

            // 1 - Notif
            if (entry && entry.NotifChannel) {
                const notifChannel = entry.NotifChannel;
                // Envoyer un message dans le canal de notification
                const channel = await client.channels.fetch(notifChannel);
                if (channel) {
                    await channel.send(`Une nouvelle mise à jour est disponible pour votre région ! ${countdown}`);
                    // Envoyer le recap message après la notification
                    const recapMessageContent = "Récapitulatif des participants : Aucun participant pour l'instant.";
                    const notifChannelRecapMessage = await channel.send(recapMessageContent);
                    entry.RecapMessages.push(notifChannelRecapMessage.id);
                    await entry.save();
                } else {
                    console.error(`Impossible de trouver le canal pour la guilde ${guildId}.`);
                }
            } else {
                console.error(`Aucune entrée trouvée ou canal de notification non défini pour la guilde ${guildId}.`);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la notification:", error);
        }
    }

    // Fonction pour écouter le postChannel et gérer les images
    client.on('messageCreate', async (message) => {
        try {
            // Vérifier si le message provient du postChannel et contient des images
            const entry = await Schema.findOne({ PostChannel: message.channel.id });
            if (entry && message.attachments.size > 0) {
                const threadId = entry.LatestThread;
                if (threadId) {
                    const thread = await client.channels.fetch(threadId);
                    if (thread && thread.isThread()) {
                        // Vérifier si l'utilisateur a déjà posté
                        if (entry.Participants.includes(message.author.id)) {
                            // Envoyer un message à l'utilisateur
                            const replyMessage = await message.reply({
                                content: `<@${message.author.id}> vous avez déjà posté une réponse.`
                            });
                            // Supprimer le message après 2 secondes
                            setTimeout(() => replyMessage.delete().catch(console.error), 2000);
                            // Supprimer le message original
                            if (message.deletable) {
                                await message.delete();
                            } else {
                                console.error("Le bot n'a pas la permission de supprimer ce message.");
                            }
                            return;
                        }

                        // Ajouter l'auteur aux participants
                        entry.Participants.push(message.author.id);
                        await entry.save();

                        // Construire le message à envoyer
                        const author = message.author;
                        const content = `<@${author.id}> a répondu : ${message.content}`;
                        const attachments = message.attachments.map(attachment => attachment);

                        // Envoyer le message dans le thread
                        const sentMessage = await thread.send({ content, files: attachments });

                        // Ajouter des réactions emoji au message
                        const emojis = ['👍🏼', '😃', '😲', '😍', '😂'];
                        for (const emoji of emojis) {
                            await sentMessage.react(emoji);
                        }

                        // Mettre à jour les recap messages
                        const recapContent = `Récapitulatif des participants : ${entry.Participants.map(id => `<@${id}>`).join(', ')}`;
                        for (const messageId of entry.RecapMessages) {
                            try {
                                let channel;
                                switch (messageId) {
                                    case entry.RecapMessages[0]:
                                        channel = await client.channels.fetch(entry.PostChannel);
                                        break;
                                    case entry.RecapMessages[1]:
                                        channel = thread;
                                        break;
                                    default:
                                        channel = await client.channels.fetch(entry.NotifChannel);
                                        break;
                                }
                                const recapMessage = await channel.messages.fetch(messageId);
                                if (recapMessage) {
                                    await recapMessage.edit(recapContent);
                                }
                            } catch (error) {
                                console.error(`Erreur lors de la mise à jour du recap message (ID: ${messageId}):`, error);
                            }
                        }

                        // Supprimer le message original
                        if (message.deletable) {
                            await message.delete();
                        } else {
                            console.error("Le bot n'a pas la permission de supprimer ce message.");
                        }
                    } else {
                        console.error(`Impossible de trouver le thread pour la guilde ${entry.Guild}.`);
                    }
                }
            }
        } catch (error) {
            console.error("Erreur lors de la gestion des images dans le postChannel:", error);
        }
    });

    // Définir un intervalle pour exécuter la vérification toutes les 30 secondes
    setInterval(checkApi, 30000);
};
