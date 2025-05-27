const discord = require('discord.js');
const voiceRoles = require("../../database/models/voiceRoles");

module.exports = async (client, channel) => {
    let types = {
        0: "Text Channel",
        2: "Voice Channel",
        4: "Category",
        5: "News Channel",
        10: "News Thread",
        11: "Public Thread",
        12: "Private Thread",
        13: "Stage Channel",
        14: "Category",
    }

    const logsChannel = await client.getLogs(channel.guild.id);
    if (!logsChannel) return;

    // Vérifier si le salon créé est un salon vocal
    if (channel.type !== Discord.ChannelType.GuildVoice) return;

    try {
        // Créer un rôle avec le même nom que le salon vocal
        const role = await channel.guild.roles.create({
            name: `🔊 ${channel.name}`,
            color: 'Blue',
            reason: 'Rôle automatique pour salon vocal'
        });

        // Sauvegarder dans la base de données
        await new voiceRoles({
            Guild: channel.guild.id,
            VoiceChannel: channel.id,
            Role: role.id
        }).save();

        console.log(`[Voice Roles] Rôle ${role.name} créé et associé au salon ${channel.name}`);
    } catch (error) {
        console.error("[Voice Roles] Erreur lors de la création automatique du rôle:", error);
    }

    console.log(channel.type)
    client.embed({
        title: `🔧・Channel created`,
        desc: `A channel has been created`,
        fields: [
            {
                name: `> Name`,
                value: `- ${channel.name}`
            },
            {
                name: `> ID`,
                value: `- ${channel.id}`
            },
            {
                name: `> Category`,
                value: `- ${channel.parent}`
            },
            {
                name: `> Channel`,
                value: `- <#${channel.id}>`
            },
            {
                name: `> Type`,
                value: `- ${types[channel.type]}`
            }
        ]
    }, logsChannel).catch(() => { })
};