const Discord = require('discord.js');

const Schema = require("../../database/models/triggers");
const db = require("../../database/connect.js");

module.exports = async (client, interaction, args) => {
    const nom = interaction.options.getString('nom');
    const regex = interaction.options.getString('regex');
    const regexFlags = interaction.options.getString('regex-flags');
    const response = interaction.options.getString('response');
    const status = interaction.options.getString('status');
    const deleting = interaction.options.getString('deleting');
    const mention = interaction.options.getString('mention');
    const reply = interaction.options.getString('reply');
    
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
            data.RegexFlags = regexFlags;
            data.Response = response;
            data.Active = status;
            data.Deleting = deleting;
            data.Reply = reply;
            data.Mention = mention;
            data.save();
        }
        else {
            new Schema({
                Guild: interaction.guild.id,
                triggerName: nom,
                Regex: regex,
                RegexFlags: regexFlags,
                Response: response,
                Active: status,
                Deleting: deleting,
                Reply: reply,
                Mention: mention
            }).save();
        }
        const triggerWords = await db.connect();
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
 
