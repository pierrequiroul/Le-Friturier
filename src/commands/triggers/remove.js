const Discord = require('discord.js');
const Schema = require("../../database/models/triggers");

module.exports = async (client, interaction, args) => {
    try {
        const alias = interaction.options.getString('alias');
        const data = await Schema.findOne({ Guild: interaction.guild.id, 'Triggers.alias': alias });
    
        if (data) {
            const triggerIndex = data.Triggers.findIndex(trigger => trigger.alias === alias);
            if (triggerIndex === -1) {
                return client.errNormal({
                    error: `Ce trigger n'existe pas dans la base de données !`,
                    type: 'editreply'
                }, interaction);
            }

            data.Triggers.splice(triggerIndex, 1); // Remove the trigger from the array
            await data.save(); // Save the updated document

            client.succNormal({
                text: `Ce trigger a été supprimé`,
                fields: [
                    {
                        name: `:dart: ┆ Trigger`,
                        value: `${alias}`
                    }
                ],
                type: 'editreply'
            }, interaction);
        }
        else {
            client.errNormal({
                error: `Ce serveur ne possède pas de données!`,
                type: 'editreply'
            }, interaction);
        }
    } catch (error) {
        console.error(error);
        // Handle error
    }
}