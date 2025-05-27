const { PermissionsBitField, ChannelType } = require('discord.js');

// Split a voice channel into multiple defined voice channels
module.exports = async (client, interaction) => {
    const fromChannel = interaction.options.getChannel('from');
    const toA = interaction.options.getChannel('to_a');
    const toB = interaction.options.getChannel('to_b');
    const toC = interaction.options.getChannel('to_c');
    const toD = interaction.options.getChannel('to_d');

    const targetChannels = [toA, toB, toC, toD].filter(Boolean);

    // --- Vérifications ---
    if (!fromChannel || fromChannel.type !== ChannelType.GuildVoice) {
        return client.errNormal({
            error: `The starting channel must be a voice channel.`,
            type: 'editreply'
        }, interaction);
    }

    if (targetChannels.length < 2) {
        return client.errNormal({
            error: `Please specify at least two target voice channels.`,
            type: 'editreply'
        }, interaction);
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return client.errNormal({
            error: `I do not have permission to move members.`,
            type: 'editreply'
        }, interaction);
    }

    // --- Préparation des membres ---
    const includeBots = false;
    const membersToMove = [...fromChannel.members.values()].filter(m => includeBots || !m.user.bot);

    if (membersToMove.length === 0) {
        return client.errNormal({
            error: `There are no members to move in \`${fromChannel.name}\`.`,
            type: 'editreply'
        }, interaction);
    }

    // --- Mélange aléatoire ---
    const shuffled = membersToMove.sort(() => Math.random() - 0.5);

    // --- Répartition circulaire dans les salons ---
    const movePromises = shuffled.map((member, index) => {
        const target = targetChannels[index % targetChannels.length];
        if (member.voice.channelId === target.id) return Promise.resolve(false);
        return member.voice.setChannel(target, `Split by ${interaction.user.tag}`)
            .then(() => true)
            .catch(err => {
                console.error(`Error moving ${member.user.tag}:`, err);
                return false;
            });
    });

    // --- Résultats ---
    const results = await Promise.all(movePromises);
    const movedCount = results.filter(Boolean).length;

    return client.succNormal({
        text: `🔀 Split completed: ${movedCount} member(s) moved from \`${fromChannel.name}\` to ${targetChannels.length} voice channel(s).`,
        type: 'editreply'
    }, interaction);
};
