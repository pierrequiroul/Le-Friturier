const Discord = require('discord.js');

const Schema = require("../../database/models/triggers");
const { triggersWords } = require("../../Collection");

module.exports = async (client, interaction, args) => {
    const nom = interaction.options.getString('nom');

    Schema.findOne({ Guild: interaction.guild.id, Trigger: nom }, async (err, data) => {
        if (data) {
            if (!data.Trigger == nom) {
                return client.errNormal({
                    error: `Ce mot n'existe pas dans la base de données !`,
                    type: 'editreply'
                }, interaction);
            }

            //const filtered = data.Words.filter((target) => target !== word);
            
            await Schema.findOneAndDelete({Guild: interaction.guild.id, Trigger: nom });
            /*await Schema.findOneAndUpdate({  }, {
                Guild: interaction.guild.id,
                Words: filtered
            });*/

            triggersWords.delete(interaction.guild.id, nom)

            client.succNormal({
                text: `Ce mot a été retiré de la liste noire !`,
                fields: [
                    {
                        name: `<:uo_BotEvent:1015565719330627584> ┆ Mot`,
                        value: `${nom}`
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
    })
}

 
