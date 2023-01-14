const Discord = require('discord.js');

const Schema = require("../../database/models/family");

module.exports = async (client, interaction, args) => {

    const target = interaction.options.getUser('membre') || interaction.user;

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: target.id });

    let parents = [];
    if (data && data.Parent.length > 0) {
        for (let i = 0; i < data.Parent.length; i++) {
            parents.push("<@!" + data.Parent[i] + ">");
        }
    }
    let children = [];
    if (data && data.Children.length > 0) {

        for (let i = 0; i < data.Children.length; i++) {
            children.push("<@!" + data.Children[i] + ">");
        }
    }
    
    let fields = [{
                name: `Partenaire`,
                value: `${data && data.Partner ? `<@!${data.Partner}>` : `Cette personne n'est pas mariée`}`
            },
            {
                name: `Parents`,
                value: `${data && data.Parent.length > 0 ? `${parents.join(", ")}` : `Cette personne n'a pas de parents`}`
            }
        ];

        // Check siblings
        if (data && data.Parent.length > 0) {
            let siblings = new Set();
            const parentPromises = data.Parent.map(async parent => {
                const dataParent = await Schema.findOne({ Guild: interaction.guild.id, User: parent });
                if (dataParent && dataParent.Children.length > 0) {
                    for (let i = 0; i < dataParent.Children.length; i++) {
                        if (target.id !== dataParent.Children[i]) siblings.add("<@!" + dataParent.Children[i] + ">");
                    }
                }
            });
            await Promise.all(parentPromises);
            if(data.Parent.length > 1) {
                siblings.add("\n");
            } 
            siblings = [...siblings].join(", ");
            
        } else {
            siblings = `Cette personne n'a pas de frères et soeurs`
        };
    
        fields.push({
            name: `Frères/Soeurs`,
            value: siblings
        });
        fields.push({
            name: `Enfants`,
            value: `${data && data.Children.length > 0 ? `${children.join(", ")}` : `Cette personne n'a pas d'enfants`}`
        });
    client.embed({
        title: `👪・Famille de ${target.username}`,
        thumbnail: target.avatarURL({ size: 1024 }),
        fields: fields,
        type: 'editreply'
    }, interaction, false)
}

 
