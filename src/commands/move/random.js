const { PermissionsBitField, ChannelType } = require('discord.js');

// Move a random number of members from a voice channel to another voice channel
module.exports = async (client, interaction) => {
    const inputStartChannel = interaction.options.getChannel('from');
    const endChannel = interaction.options.getChannel('to');
    const moveLive = interaction.options.getBoolean('exclude_streamers');
    const amount = interaction.options.getInteger('amount');

    const startChannel = inputStartChannel || interaction.member.voice.channel;

    if (!startChannel) {
        return client.errNormal({
            error: `You are not in a voice channel and no starting channel was specified.`,
            type: 'editreply'
        }, interaction);
    }

    if (startChannel.id === endChannel.id) {
        return client.errNormal({
            error: `The starting and destination channels cannot be the same.`,
            type: 'editreply'
        }, interaction);
    }

    if (
        startChannel.type !== ChannelType.GuildVoice ||
        endChannel.type !== ChannelType.GuildVoice
    ) {
        return client.errNormal({
            error: `Both channels must be voice channels.`,
            type: 'editreply'
        }, interaction);
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
        return client.errNormal({
            error: `The bot does not have permission to move members.`,
            type: 'editreply'
        }, interaction);
    }

    const eligibleMembers = [...startChannel.members.values()].filter(member =>
        !member.user.bot && (moveLive ? !member.voice.streaming : true)
    );

    if (eligibleMembers.length === 0) {
        return client.errNormal({
            error: `No members to move according to the criteria.`,
            type: 'editreply'
        }, interaction);
    }

    if (eligibleMembers.length < amount) {
        return client.errNormal({
            error: `Only ${eligibleMembers.length} member(s) available, but ${amount} requested.`,
            type: 'editreply'
        }, interaction);
    }

    const selectedMembers = eligibleMembers
        .sort(() => Math.random() - 0.5)
        .slice(0, amount);

    const movePromises = selectedMembers.map(member =>
        member.voice.setChannel(endChannel, `Random move by ${interaction.user.tag}`)
            .then(() => true)
            .catch(err => {
                console.error(`Error moving ${member.user.tag}:`, err);
                return false;
            })
    );

    const results = await Promise.all(movePromises);
    const movedCount = results.filter(Boolean).length;

    return client.succNormal({
        text: `🎲 Randomly moved ${movedCount} member(s) from \`${startChannel.name}\` to \`${endChannel.name}\`.`,
        type: 'editreply'
    }, interaction);
};