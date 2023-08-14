const Discord = require('discord.js');
const Triggers = require('../../database/models/triggers');
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
module.exports = async (client) => {
    client.on(Discord.Events.MessageCreate, async (message) => {
        if (message.channel.type === Discord.ChannelType.DM) return;
        if (message.author.bot) return;
        /*console.log(message);
        console.log("end");
        console.log(message.channel);
        console.log("end");
        console.log(message.author);
        console.log("end");*/
        try {
            const data = await Triggers.findOne({ Guild: message.guild.id });

            if (data) {
                const messageStripped = message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
                
                for (const trigger of data.Triggers) {
                    if (trigger.isActive) {
                        const regexFlags = trigger.regexFlags || '';
                        const regex = new RegExp(trigger.regex, regexFlags);
                        const args = messageStripped.match(regex);
                        
                        if (args) {
                            
                            var { type, responses, salon, target, targetMode, responsesType, mention, replied, emotes, cooldown, firedTimes } = trigger;
                            salon = salon.replace(/[<#>]/g, '');
                            currentSalon = message.channel.id;
                            target = target.replace(/[<@>]/g, '');
                            currentAuthor = message.author.id;
                            console.log(`----------------------------Triggers------------------------------`);
                            
                            console.log(`Détecté: Message de ${message.author.username} pour ${trigger.alias}`);
                            console.log(`Message: ${message.content}`);
                            if (responses.length >= 1) {
                                if (responsesType == true) {
                                    if (firedTimes === 0) {
                                        var iResponse = 0;
                                    } else {
                                        var iResponse = (firedTimes - 1) % response.length;
                                    }
                                    var responseFinal = response[iResponse];
                                } else {
                                    if (responsesType == false) {
                                        var responseFinal = responses[getRandomInt(response.length)];
                                    } else {
                                        var responseFinal = responses[0];
                                    }
                                }
                            }
                            //targetMode = target === message.author || target === "All";
                            if (targetMode) {
                                targetPass = target === message.author.id || target === "All";
                            } else {
                                targetPass = target !== message.author.id || target === "All";
                            }
                            // Checking cooldown
                            const currentTimestamp = new Date();
                            if (trigger.lastFiredAt == "") {
                                var lastFiredAt = new Date(0);
                            } else {
                                var lastFiredAt = new Date(trigger.lastFiredAt);
                            }
                            if (currentTimestamp.getTime() - lastFiredAt.getTime() >= cooldown) {
                                // Checking salon
                                console.log(`1. Cooldown: OK (${currentTimestamp.getTime() - lastFiredAt.getTime()})`);
                                if (message.channel == salon || salon == "All") {
                                    console.log(`2. Salon: OK (${salon})`);
                                    // Checking target
                                    if (targetPass) {
                                        
                                        if(targetMode) {
                                            console.log(`3. Target: OK (${salon})`);
                                        } else {
                                            console.log(`3. Target: OK (${currentAuthor}, ${target} is excluded)`);
                                        }
                                        /* Checking type
                                        1. Répond
                                        2. Répond puis supprime
                                        3. Supprime
                                        4. Ajoute une réaction
                                        5. Répond et ajoute une réaction
                                        */

                                        // Répond
                                        if (type === 1 || type === 2) {
                                            // Check if replied
                                            if (replied) {
                                                message.reply({
                                                    content: responseFinal,
                                                    allowedMentions: { repliedUser: mention }
                                                });
                                            } else {
                                                message.channel.send({ content: responseFinal });
                                            }
                                        }

                                        // Supprime
                                        if (type === 2 || type === 3) {
                                            message.delete({ timeout: 5000 });
                                        }

                                        // Réactions
                                        if (type == 4) {
                                            const parsedEmoji = Discord.parseEmoji(emotes);
                                        
                                            if (parsedEmoji.id) {
                                            // Custom emoji
                                            const emoji = client.emojis.cache.get(parsedEmoji.id);
                                            if (emoji) {
                                                message.react(emoji);
                                            }
                                            } else if (parsedEmoji.name) {
                                            // Basic emoji
                                            message.react(parsedEmoji.name);
                                            }
                                        }

                                        // Update firedTimes and lastFiredAt
                                        const update = {
                                            $inc: { 'Triggers.$.firedTimes': 1 },
                                            $set: { 'Triggers.$.lastFiredAt': currentTimestamp }
                                        };
                                        await Triggers.updateOne(
                                            { 'Guild': message.guild.id, 'Triggers.alias': trigger.alias },
                                            update
                                        );
                                    } else {
                                        if(targetMode) {
                                            console.log(`3. Target: FAIL (${currentAuthor} instead of ${target})`);
                                        } else {
                                            console.log(`3. Target: FAIL (${currentAuthor}, ${target} is excluded)`);
                                        }
                                    }
                                } else {
                                    console.log(`2. Salon: FAIL (${currentSalon} instead of ${salon})`);
                                }
                            } else {
                                console.log(`1. Cooldown: FAIL (${currentTimestamp.getTime() - lastFiredAt.getTime()})`);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    }).setMaxListeners(0);
/*
    client.on(Discord.Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (!oldMessage || !newMessage || oldMessage.content === newMessage.content || newMessage.channel.type === Discord.ChannelType.DM) return;
      
        try {
          const triggers = await Triggers.findOne({ Guild: newMessage.guild.id });
          if (!triggers) return;
      
          for (const trigger of triggers.Triggers) {
            if (!trigger.isActive) continue;
      
            const regex = new RegExp(trigger.regex, trigger.regexFlags);
            if (regex.test(newMessage.content)) {
              const response = trigger.response.replace(/{{user}}/g, `<@${newMessage.author.id}>`);
              const emotes = trigger.emotes ? trigger.emotes : {};
      
              const replyOptions = {
                allowedMentions: { repliedUser: trigger.mention },
              };
      
              const messageOptions = {
                reply: replyOptions,
                emotes,
              };
      
              if (!newMessage.author.bot) { // added this check
                if (trigger.type === 1) {
                  newMessage.reply(response, messageOptions);
                } else if (trigger.type === 2) {
                  newMessage.channel.send(response, messageOptions);
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }).setMaxListeners(0);
*/
      client.on('interactionCreate', async interaction => {
        if (!interaction.isAutocomplete()) return;
    
            const focusedOption = interaction.options.getFocused(true);
            let choices = [];
    
            if (focusedOption.name === 'alias') {
                try {
                    const data = await Triggers.findOne({ Guild: interaction.guild.id });
                    if (data) {
                        for (let i = 0; i < data.Triggers.length; i++) {
                            choices.push(data.Triggers[i].alias);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
    
            if (focusedOption.name === 'theme') {
                choices = ['halloween', 'christmas', 'summer'];
            }
    
            const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        
    });
};


/*const Discord = require('discord.js');

const Triggers = require("../../database/models/triggers");

module.exports = async (client) => {
    client.on(Discord.Events.MessageCreate, async (message) => {
        if (message.channel.type === Discord.ChannelType.DM) return;

        try {
            Triggers.findOne({ Guild: message.guild.id }, async (err, data) => {
                if (data) {
                    messageStripped = message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    for (let i = 0; i < data.Triggers[i].length ; i++) {
                        // Status active ?
                        if (data.Triggers[i].isActive) {
                
                            // Regex flags ?
                            console.log(messageStripped);
                            if (data.Triggers[i].regexFlags != "") {
                            var Regext = new RegExp(data.Triggers[i].regex,data.Triggers[i].regexFlags);
                            } else {
                            var Regext = data.Triggers[i].regex;
                            };
                
                            // Check filter regex
                            const args = messageStripped.match(Regext);
                            if(args != null) {
                                console.log(">> " + Regext);
                                console.log(">> " + data.Triggers[i].response);
                                console.log(data.Triggers[i].mention);

                                if (data.Triggers[i].type == 1 || data.Triggers[i].type == 2) {
                                    if (data.Triggers[i].replied) {
                                        message.reply({
                                            content: data.Triggers[i].response,
                                            allowedMentions: {
                                                repliedUser: data.Triggers[i].mention
                                            }
                                        });
                                    } else {
                                        message.send({
                                            content: data.Triggers[i].response
                                        })
                                    }
                                };
                                if (data.Triggers[i].type == 2 || data.Triggers[i].type == 3) {
                                    message.delete({ timeout: 1000 });
                                };
                            }  
                        }
                    }
                }
            })
        }
        catch { }
    }).setMaxListeners(0);

    client.on(Discord.Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (oldMessage.content === newMessage.content || newMessage.channel.type === Discord.ChannelType.DM) return;
        try {

        }
        catch { }
    }).setMaxListeners(0);
}*/