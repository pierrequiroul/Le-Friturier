const Discord = require('discord.js');
const ChannelsDB = require('../../database/models/badge-channels');
const BadgersDB = require('../../database/models/badge-users');

module.exports = async (client) => {
    client.on(Discord.Events.MessageCreate, async (message) => {
        if (message.channel.type === Discord.ChannelType.DM) return;
        if (message.author.bot) return;
        try {
            const Channels = await ChannelsDB.findOne({ Guild: message.guild.id });

            if (Channels) {
                for (let i = 0; i < Channels.Animal.length; i++) {
                    if (Channels.Animal[i].ChannelId == "Global" || Channels.Animal[i].ChannelId == message.) {
                        
                    }
                  }
                
            }
        } catch (err) {
            console.error(err);
        }
    }).setMaxListeners(0);
}