const Discord = require('discord.js');

const Schema = require("../../database/models/birthday");

module.exports = async (client, interaction, args) => {
    const months = {
        1: "Janvier",
        2: "Février",
        3: "Mars",
        4: "Avril",
        5: "Mai",
        6: "Juin",
        7: "Juillet",
        8: "Août",
        9: "Septembre",
        10: "Octobre",
        11: "Novembre",
        12: "Décembre"
    };
    
    const day = interaction.options.getNumber('jour');
    const month = interaction.options.getNumber('mois');
    var year = interaction.options.getNumber('year');
    if (year == null) {
        year = 0000;
    }
    if (!day || day > 31) return client.errNormal({ 
        error: "Mauvais format de jour !",
        type: 'editreply'
    }, interaction);

    if (!month || month > 12) return client.errNormal({
        error: "Mauvais format de mois !",
        type: 'editreply'
    }, interaction);
    
    if (!month || month < 12) return client.errNormal({
        error: "Mauvais format de mois !",
        type: 'editreply'
    }, interaction);
    
    console.log(day);
    console.log(months[month]);
    var birthdayString = "";
    if (day == 1) {
        birthdayString = "1er " + months[month];
    } else {
        birthdayString = day + " " + months[month];
    }
    console.log(birthdayString);
    Schema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }, async (err, data) => {
        if (data) {
            data.Birthday = birthdayString;
            data.save();
        }
        else {
            new Schema({
                Guild: interaction.guild.id,
                User: interaction.user.id,
                Birthday: birthdayString,
                Day: day,
                Month: month,
                Year: year,
            }).save();
        }
    })

    client.succNormal({ 
        text: `Ton anniversaire a bien été configuré avec succès !`,
        fields: [
            {
                name: "Tu es né le",
                value: birthdayString
            }
        ],
        type: 'editreply'
    }, interaction);
}

function suffixes(number) {
    const converted = number.toString();

    const lastChar = converted.charAt(converted.length - 1);

    return lastChar == "1" ?
        `${converted}st` : lastChar == "2" ?
            `${converted}nd` : lastChar == '3'
                ? `${converted}rd` : `${converted}th`
}

 
