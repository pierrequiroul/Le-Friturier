const { PermissionsBitField, ChannelType } = require('discord.js');

// Kick all members from a voice channel
module.exports = async (client, interaction) => {
    const channel = interaction.options.getChannel('from');
    const excludedUser = interaction.options.getUser('excepted_user');

    if (!channel || channel.type !== ChannelType.GuildVoice) {
        return client.errNormal({
            error: `Selected channel is not a valid voice channel.`,
            type: 'editreply'
        }, interaction);
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return client.errNormal({
            error: `The bot does not have permission to move members.`,
            type: 'editreply'
        }, interaction);
    }

    const botMember = interaction.guild.members.me;

    const membersToKick = [...channel.members.values()].filter(member =>
        (!excludedUser || member.id !== excludedUser.id) &&
        member.roles.highest.position < botMember.roles.highest.position
    );

    if (membersToKick.length === 0) {
        return client.errNormal({
            error: `No members to remove from \`${channel.name}\`.`,
            type: 'editreply'
        }, interaction);
    }

    const movePromises = membersToKick.map(member =>
        member.voice.setChannel(null, `Kicked by ${interaction.user.tag} via /move empty`)
            .then(() => true)
            .catch(err => {
                console.error(`Failed to remove ${member.user.tag}:`, err);
                return false;
            })
    );

    const results = await Promise.all(movePromises);
    const kickedCount = results.filter(Boolean).length;

    return client.succNormal({
        text: `🧹 Kicked ${kickedCount} member(s) from \`${channel.name}\`${excludedUser ? ` (excluding ${excludedUser.tag})` : ''}.`,
        type: 'editreply'
    }, interaction);
};
