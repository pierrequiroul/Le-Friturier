const { PermissionsBitField, ChannelType } = require('discord.js');

// Regroup members from multiple defined voice channels into one voice channel
module.exports = async (client, interaction) => {
    const fromA = interaction.options.getChannel('from_a');
    const fromB = interaction.options.getChannel('from_b');
    const fromC = interaction.options.getChannel('from_c');
    const fromD = interaction.options.getChannel('from_d');
    const destinationChannel = interaction.options.getChannel('to');

    const sourceChannels = [fromA, fromB, fromC, fromD].filter(channel => channel);

    // --- Vérifications ---
    if (!destinationChannel || destinationChannel.type !== ChannelType.GuildVoice) {
        return client.errNormal({
            error: `The destination must be a voice channel.`,
            type: 'editreply'
        }, interaction);
    }

    if (sourceChannels.length < 2) {
        return client.errNormal({
            error: `At least two source voice channels must be provided.`,
            type: 'editreply'
        }, interaction);
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return client.errNormal({
            error: `I do not have permission to move members.`,
            type: 'editreply'
        }, interaction);
    }

    // --- Récupération des membres ---
    const membersToMove = sourceChannels.flatMap(channel =>
        [...channel.members.values()].filter(
            member => member.voice.channelId !== destinationChannel.id && !member.user.bot
        )
    );

    if (membersToMove.length === 0) {
        return client.errNormal({
            error: `No members found to move (they may already be in the destination).`,
            type: 'editreply'
        }, interaction);
    }

    // --- Déplacement des membres ---
    const movePromises = membersToMove.map(member =>
        member.voice.setChannel(destinationChannel, `Regrouped by ${interaction.user.tag}`)
            .then(() => true)
            .catch(err => {
                console.error(`Error moving ${member.user.tag}:`, err);
                return false;
            })
    );

    const results = await Promise.all(movePromises);
    const movedCount = results.filter(Boolean).length;

    // --- Confirmation ---
    return client.succNormal({
        text: `🔁 Regrouped ${movedCount} member(s) into \`${destinationChannel.name}\`.`,
        type: 'editreply'
    }, interaction);
};
