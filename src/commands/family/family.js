const Discord = require('discord.js');

const Schema = require("../../database/models/family");

module.exports = async (client, interaction, args) => {

    const target = interaction.options.getUser('user') || interaction.user;

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: target.id });

    family = false;
    let temp = [];
    if (data && data.Parent.length > 0) {
        for (let i = 0; i < data.Parent.length; i++) {
            temp.push("<@!" + data.Parent[i] + ">");
        };
        family = true;
    }
    let temp2 = [];
    if (data && data.Children.length > 0) {

        for (let i = 0; i < data.Children.length; i++) {
            temp2.push("<@!" + data.Children[i] + ">");
        };
        family = true;
    }
    let fields = [];
    if (data && data.Partner) fields.push({
                name: `Partenaire`,
                value: `${data && data.Partner ? `<@!${data.Partner}>` : `Cette personne n'est pas mariée`}`
            });
    if (data && data.Parent.length > 0) fields.push({
                name: `Parents`,
                value: `${data && data.Parent.length > 0 ? `${temp.join(", ")}` : `Cette personne n'a pas de parents`}`
            });
    // Check siblings
    if (data && data.Parent.length > 0) {
        let temp3 = new Set();
        const parentPromises = data.Parent.map(async parent => {
            const dataParent = await Schema.findOne({ Guild: interaction.guild.id, User: parent });
            if (dataParent && dataParent.Children.length > 0) {
                for (let i = 0; i < dataParent.Children.length; i++) {
                    if (target.id !== dataParent.Children[i]) temp3.add("<@!" + dataParent.Children[i] + ">");
                }
            }
        });
        await Promise.all(parentPromises);
        if(data.Parent.length > 1) {
            temp3.add("\n");
        } 
        temp3 = [...temp3].join(", ");
        if(temp3.length == 0) {
            fields.push({
                name: `Frères/Soeurs`,
                value: temp3
            });  
        };
        family = true;
    }
    if (data && data.Children.length > 0) fields.push({
            name: `Enfants`,
            value: `${data && data.Children.length > 0 ? `${temp2.join(", ")}` : `Cette personne n'a pas d'enfants`}`
        });
        family = true;

    if (!family) fields.push({
            name: `Famille`,
            value: `Cette personne n'a pas de famille`
        });
}

    client.embed({
        title: `👪・Famille de ${target.username}`,
        thumbnail: target.avatarURL({ size: 1024 }),
        fields: fields,
        type: 'editreply'
    }, interaction, false)
}

 
