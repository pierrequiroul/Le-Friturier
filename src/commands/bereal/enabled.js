const Discord = require('discord.js');
const Schema = require("../../database/models/bereal");

module.exports = async (client, interaction, args) => {
    const enabled = interaction.options.getBoolean("enabled");

    try {
        let data = await Schema.findOne({ Guild: interaction.guild.id });

        if (data) {
            data.Enabled = enabled;
            await data.save();

            client.succNormal({
                text: `Setup success`,
                fields: [
                    {
                        name: `Status`,
                        value: `**${enabled}**`
                    }
                ],
                type: 'editreply'
            }, interaction);
        } else {
            client.error({
                text: `Setup error: doesnt exist`,
                type: 'editreply'
            }, interaction);
        }

        
    } catch (error) {
        console.error("An error occurred:", error);
        interaction.reply({ content: 'An error occurred while setting up the configuration.', ephemeral: true });
    }
}
