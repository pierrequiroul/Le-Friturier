const Discord = require('discord.js');
const Schema = require("../../database/models/bereal");

module.exports = async (client, interaction, args) => {
    let notifChannel = interaction.options.getChannel("notifchannel"),
        postChannel = interaction.options.getChannel("postchannel"),
        timelimit = interaction.options.getInteger("timelimit") || 120;
        region = interaction.options.getString("region") || "europe-west";

    try {
        let data = await Schema.findOne({ Guild: interaction.guild.id });

        if (data) {
            data.PostChannel = postChannel.id;
            data.NotifChannel = notifChannel.id;
            data.Timelimit = timelimit;
            data.Region = region;
            await data.save();
        } else {
            await new Schema({
                Guild: interaction.guild.id,
                PostChannel: postChannel.id,
                NotifChannel: notifChannel.id,
                Timelimit: timelimit,
                Region: region,
                Enabled: true
            }).save();
        }

        client.succNormal({
            text: `Setup success`,
            fields: [
                {
                    name: `Notif Channel`,
                    value: `**${notifChannel}**`
                },
                {
                    name: `Post Channel`,
                    value: `**${postChannel}**`
                },
                {
                    name: `Timelimit`,
                    value: `**${timelimit}**s`
                },
                {
                    name: `Region`,
                    value: `**${region}**`
                },
            ],
            type: 'editreply'
        }, interaction);
    } catch (error) {
        console.error("An error occurred:", error);
        interaction.reply({ content: 'An error occurred while setting up the configuration.', ephemeral: true });
    }
}
