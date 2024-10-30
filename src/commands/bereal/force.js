const Discord = require('discord.js');
const Schema = require("../../database/models/bereal");

module.exports = async (client, interaction, args) => {
    const override = interaction.options.getBoolean("override") || false;

    function isToday(timestamp) {
        const date = new Date(timestamp * 1000);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    try {
        let data = await Schema.findOne({ Guild: interaction.guild.id });

        client.succNormal({
            text: `Notif forcée`,
            fields: [
                {
                    name: isToday(data.LastFiredLocal) && !override ? `Erreur` : `Success`,
                    value: isToday(data.LastFiredLocal) && !override ? `La notif a déjà éte envoyée aujourd'hui. Utilise override pour l'envoyer quand même` : `Notification envoyée`
                }
            ],
            type: 'editreply'
        }, interaction);

        if (data) {
            data.LastFiredOfficial = 0
            if(override) data.LastFiredLocal = 0;
            await data.save();
        }

        

    } catch (error) {
        console.error("An error occurred:", error);
        interaction.reply({ content: 'An error occurred while setting up the configuration.', ephemeral: true });
    }
}
