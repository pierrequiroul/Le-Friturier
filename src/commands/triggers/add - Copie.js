const Discord = require('discord.js');
const Schema = require("../../database/models/triggers");

module.exports = async (client, interaction, args) => {
    try {
    const isActive = interaction.options.getString('isactive') ?? true;
    const alias = interaction.options.getString('alias').toLowerCase();
    const type = interaction.options.getString('type');
    const typeString = ["✖️", "Répond", "Répond puis supprime", "Supprime", "Ajoute une réaction", "Répond et ajoute une réaction"];
    const regex = interaction.options.getString('regex');
    const regexFlags = interaction.options.getString('regexflags') || "";
    
    let responses = [];
    if (type === 1 || type === 2) {
        const response = interaction.options.getString('response');
        responses = response.includes(';;') ? response.split(';;') : [response];
    }

    const responsestype = interaction.options.getString('responsestype') || 1;
    const rTypeString = ["✖️", "En séquence", "Aléatoire", "La première"];

    let emotes;
    if (type === 4 || type === 5) {
        emotes = interaction.options.getString('emotes');
        const parsedEmoji = Discord.parseEmoji(emotes);
        if (!parsedEmoji) return client.errNormal({
            error: `Emoji introuvable dans ce serveur!`,
            type: 'editreply'
        }, interaction)
    } else {
        emotes = "Pas utilisé"
    };
    const salon = interaction.options.getChannel('salon') || "All";
    const target = interaction.options.getUser('target') || "All";
    const targetMode = interaction.options.getString('targetmode') ?? true;

    const mention = interaction.options.getString('mention') ?? true;
    const replied = interaction.options.getString('replied') ?? true;
    const cooldown = interaction.options.getInteger('cooldown') ?? 0;
    let firedLastAt = "Never";
    let firedTimes = 0;
    /*let previousTriggers = {
        isActive: "✖️",
        alias: "✖️",
        type: 0,
        regex: "✖️",
        regexFlags: "✖️",
        responses: "✖️",
        responsesType: "✖️",
        emotes: "✖️",
        salon: "✖️",
        target: "✖️",
        targetMode: "✖️",
        mention: "✖️",
        replied: "✖️",
        cooldown: 0,
      };*/
        const data = await Schema.findOne({ Guild: interaction.guild.id, 'Triggers.alias': alias });

            if (data) {
                
                const existingTriggerIndex = data.Triggers.findIndex(trigger => trigger.alias === alias);
                /*previousTriggers = data.Triggers[existingTriggerIndex];
                lastFiredAt = data.Triggers[existingTriggerIndex].lastFiredAt;
                firedTimes = data.Triggers[existingTriggerIndex].firedTimes;
                console.log(previousTriggers);
                */
                if (existingTriggerIndex >= 0) {
                    console.log(`Trigger "${alias}" already exists in the array.`);
                    /*data.Triggers[existingTriggerIndex] = {
                        isActive: isActive,
                        alias: alias,
                        type: type,
                        regex: regex,
                        regexFlags: regexFlags,
                        responses: responses,
                        responsesType : responsestype,
                        emotes: emotes,
                        salon: salon,
                        target : target,
                        targetMode : targetMode,
                        mention: mention,
                        replied: replied,
                        cooldown: cooldown,
                        firedTimes: firedTimes,
                        firedLastAt: lastFiredAt
                    };*/
                } else {
                    data.Triggers.push({
                        isActive: isActive,
                        alias: alias,
                        type: type,
                        regex: regex,
                        regexFlags: regexFlags,
                        responses: responses,
                        responsesType : responsestype,
                        emotes: emotes,
                        salon: salon,
                        target : target,
                        targetMode : targetMode,
                        mention: mention,
                        replied: replied,
                        cooldown: cooldown,
                        firedTimes: firedTimes,
                        firedLastAt: lastFiredAt
                    });
                }
                await data.save();
            } else {
                await new Schema({
                    Guild: interaction.guild.id,
                    Triggers: [
                        {
                            isActive: isActive,
                            alias: alias,
                            type: type,
                            regex: regex,
                            regexFlags: regexFlags,
                            responses: responses,
                            responsesType : responsestype,
                            emotes: emotes,
                            salon: salon,
                            target : target,
                            targetMode : targetMode,
                            mention: mention,
                            replied: replied,
                            cooldown: cooldown,
                            firedTimes: 0,
                            firedLastAtAt: firedLastAt
                        }
                    ]
                }).save();
            }
        
        client.succNormal({
            text: `Le mot est ajouté à la liste des trigger!`,
            fields: [
                {
                    "name": `💬┆ Trigger`,
                    "value": `⠀\n✅ \`${alias}\`\n⠀`
                },
                /*{
                  "name": `⏮️ Previous`,
                  "value": `⠀\n
                            ⇢ **Alias** : \`${previousTriggers.alias}\`\n
                            ⇢ **Type** : \`${typeString[previousTriggers.type]}\`\n
                            ⇢ **Regex** : \`${previousTriggers.regex}\`\n
                            ⇢ **Flags regex** : \`${previousTriggers.regexFlags}\`\n\n
                            ⇢ **Réponses** : \n⠀⠀⠀\`${previousTriggers.responsesFormatted}\`\n⠀⠀⠀${previousTriggers.responsesFormatted}\n
                            ⇢ **Mode** : ${rTypeString[previousTriggers.responsesType]}\n
                            ⇢ **Emotes** : \`${previousTriggers.emotesFormatted}\` ${previousTriggers.emotesFormatted}\n\n
                            ⇢ **Cooldown** : ${cooldown} ms\n
                            ⇢ **Salon** : ${previousTriggers.salon}\n
                            ⇢ **Target** : ${previousTriggers.target}\n
                            ⇢ **Mode** : ${previousTriggers.targetMode ? `Uniquement la target` : `Exclure la target`}\n\n
                            ⇢ **Additionnels** : \n
                                                    ⠀⠀⠀${previousTriggers.mention ? `✅` : `🟥`} Mentionne\n
                                                    ⠀⠀⠀${previousTriggers.replied ? `✅` : `🟥`} Message suivi`,
                  "inline": true
                },*/
                {
                  "name": `🆕 Nouveau`,
                  "value": `⠀\n
                            ⇢ **Alias** : \`${alias}\`\n
                            ⇢ **Type** : \`${typeString[type]}\`\n
                            ⇢ **Regex** : \`/${regex}/\`\n
                            ⇢ **Flags regex** : \`${regexFlags}\`\n\n
                            ⇢ **Réponse** : \n⠀⠀⠀\`${responses}\`\n⠀⠀⠀${responses}\n
                            ⇢ **Réponses** : ${rTypeString[responsestype]}\n
                            ⇢ **Emotes** : \`${emotes}\` ${emotes}\n\n
                            ⇢ **Cooldown** : ${cooldown} ms\n
                            ⇢ **Salon** : ${salon == "All" ? `Tous les salons` : salon}\n
                            ⇢ **Target** : ${target == "All" ? `Tout le monde` : target}\n
                            ⇢ **Mode** : ${targetMode ? `Uniquement la target` : `Exclure la target`}\n\n
                            ⇢ **Additionnels** : \n
                                                    ⠀⠀⠀${mention ? `✅` : `🟥`}  Mentionne\n
                                                    ⠀⠀⠀${replied ? `✅` : `🟥`} Message suivi`,
                  "inline": true
                },
                {
                    "name": `Informations`,
                    "value": `\n
                    ⠀⠀⠀${firedLastAt}\n
                    ⠀⠀⠀Déclenchés ${firedTimes} fois`
                }
              ],
            type: 'editreply'
        }, interaction);
    } catch (error) {
        console.error(error);
        // Handle error
    }
}