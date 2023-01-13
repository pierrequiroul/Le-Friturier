const Discord = require('discord.js');

const Schema = require("../../database/models/family");

module.exports = async (client, interaction, args) => {

    const target = interaction.options.getUser('user') || interaction.user;

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: target.id });
    
    for (let i = 0; i < data.Parent.length; i++) {
        temp[i] = "<@!" + data.Children[i] + ">";
    }

    for (let i = 0; i < data.Children.length; i++) {
        temp2[i] = "<@!" + data.Children[i] + ">";
    }
    
    client.embed({
        title: `👪・Famille de ${target.username}`,
        thumbnail: target.avatarURL({ size: 1024 }),
        fields: [
            {
                name: `Partenaire`,
                value: `${data && data.Partner ? `<@!${data.Partner}>` : `Cette personne n'est pas mariée`}`
            },
            {
                name: `Parents`,
                value: `${data && data.Parent.length > 0 ? `${temp.join(", ")}` : `Cette personne n'a pas de parents`}`
            },
            /*{
                name: `Frères/Soeurs`,
                value: `${data && data.Children.length > 0 ? `${data.Children.join(", ")}` : `Cette personne n'a pas d'enfants`}`
            },*/
            {
                name: `Enfants`,
                value: `${data && data.Children.length > 0 ? `${temp2.join(", ")}` : `Cette personne n'a pas d'enfants`}`
            }
        ],
        type: 'editreply'
    }, interaction)
}

 
