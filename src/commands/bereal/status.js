const Discord = require('discord.js');
const Schema = require("../../database/models/bereal");

module.exports = async (client, interaction, args) => {
    try {
        let data = await Schema.findOne({ Guild: interaction.guild.id });

        if (!data) {
            return client.error({
                text: `No BeReal configuration found for this server`,
                type: 'editreply'
            }, interaction);
        }

        const postChannel = await client.channels.fetch(data.PostChannel).catch(() => null);
        const notifChannel = await client.channels.fetch(data.NotifChannel).catch(() => null);

        const fields = [
            {
                name: "Status",
                value: data.Enabled ? "✅ Enabled" : "❌ Disabled",
                inline: true
            },
            {
                name: "Post Channel",
                value: postChannel ? `${postChannel}` : "Channel not found",
                inline: true
            },
            {
                name: "Notification Channel",
                value: notifChannel ? `${notifChannel}` : "Channel not found",
                inline: true
            },
            {
                name: "Time Limit",
                value: `${data.Timelimit} seconds`,
                inline: true
            },
            {
                name: "Region",
                value: data.Region,
                inline: true
            },
            {
                name: "Last BeReal",
                value: data.LastFiredLocal ? `<t:${data.LastFiredLocal}:R>` : "Never",
                inline: true
            }
        ];

        // Ajouter les statistiques
        if (data.stats) {
            fields.push(
                {
                    name: "📊 Total Participations",
                    value: `${data.stats.totalParticipations}`,
                    inline: true
                },
                {
                    name: "⚡ Best Streak",
                    value: `${data.stats.bestStreak} days`,
                    inline: true
                },
                {
                    name: "⏱️ Average Response Time",
                    value: `${Math.floor(data.stats.averageResponseTime / 60)} minutes`,
                    inline: true
                }
            );

            // Trouver le meilleur participant
            let bestParticipant = { id: null, count: 0 };
            data.stats.participationsPerUser.forEach((count, userId) => {
                if (count > bestParticipant.count) {
                    bestParticipant = { id: userId, count };
                }
            });

            if (bestParticipant.id) {
                fields.push({
                    name: "👑 Most Active Participant",
                    value: `<@${bestParticipant.id}> (${bestParticipant.count} participations)`,
                    inline: true
                });
            }
        }

        if (data.Participants && data.Participants.length > 0) {
            fields.push({
                name: "Current Participants",
                value: `${data.Participants.length} members`,
                inline: true
            });
        }

        client.embed({
            title: `📸 BeReal Configuration`,
            desc: `Current BeReal setup for ${interaction.guild.name}`,
            fields: fields,
            type: 'editreply'
        }, interaction);

    } catch (error) {
        console.error("An error occurred:", error);
        client.error({
            text: `An error occurred while fetching the configuration.`,
            type: 'editreply'
        }, interaction);
    }
}