const Discord = require('discord.js');

const Schema = require("../../database/models/triggers");
const { triggersWords } = require("../../Collection");

module.exports = async (client, interaction, args) => {
    const nom = interaction.options.getString('nom');
    const regex = interaction.options.getString('regex');
    const response = interaction.options.getString('response');
    
    Schema.findOne({ Guild: interaction.guild.id, triggerName: nom }, async (err, data) => {
        if (data) {
            if (data.triggerName == nom) {
                return client.errNormal({ 
                    error: `Ce trigger existe déjà et a été mis à jour avec les nouveaux paramètres ! Le regex précédent était ${data.Regex}`,
                    type: 'editreply' 
                }, interaction);
            }
            data.triggerName = nom;
            data.Regex = regex;
            data.Response = response;
            data.save();
            triggersWords.get(nom).push(nom);
        }
        else {
            new Schema({
                Guild: interaction.guild.id,
                triggerName: nom,
                Regex: regex,
                Response: response
            }).save();

            triggersWords.set(nom, nom);
        }
    })

    client.succNormal({
        text: `Le mot est ajouté à la liste des trigger.`,
        fields: [
            {
                name: `:dart: ┆ Trigger`,
                value: `${nom}`
            }
        ],
        type: 'editreply'
    }, interaction);
}

 
/*
const Discord = require('discord.js');

const Schema = require("../../database/models/blacklist");
const { blacklistedWords } = require("../../Collection");

module.exports = async (client, interaction, args) => {
    const word = interaction.options.getString('word');

    Schema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
        if (data) {
            if (data.Words.includes(word)) {
                return client.errNormal({ 
                    error: `Ce mot existe déjà dans la base de donnée!`,
                    type: 'editreply' 
                }, interaction);
            }
            data.Words.push(word);
            data.save();
            blacklistedWords.get(interaction.guild.id).push(word);
        }
        else {
            new Schema({
                Guild: interaction.guild.id,
                Words: word
            }).save();

            blacklistedWords.set(interaction.guild.id, [word]);
        }
    })

    client.succNormal({
        text: `Le mot est ajouté à la liste noire.`,
        fields: [
            {
                name: `<:uo_BotEvent:1015565719330627584> Mot`,
                value: `${word}`
            }
        ],
        type: 'editreply'
    }, interaction);
}
*/
 
