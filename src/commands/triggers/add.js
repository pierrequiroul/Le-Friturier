const Discord = require('discord.js');
const Schema = require("../../database/models/triggers");

module.exports = async (client, interaction, args) => {
    try {

        let data = await Schema.findOne({ Guild: interaction.guild.id });

        if (!data) {
            // If no document exists for the guild, create a new one
            data = new Schema({
                Guild: interaction.guild.id,
                Triggers: []
            });
        }

        const alias = interaction.options.getString('alias').toLowerCase();
        const existingTriggerIndex = data.Triggers.findIndex(trigger => trigger.alias === alias);

        if (existingTriggerIndex >= 0) {
            console.log(`Trigger "${alias}" already exists in the array.`);
            client.errNormal({
                error: `Ce trigger existe déjà dans la base de données`,
                type: 'editreply'
            }, interaction);
        } else {
            const isActive = interaction.options.getString('isactive') ?? true;
            const type = interaction.options.getString('type');
            const typeString = ["✖️", "Répond", "Répond puis supprime", "Supprime", "Ajoute une réaction", "Répond et ajoute une réaction"];
            const regex = interaction.options.getString('regex');
            const regexFlags = interaction.options.getString('regexflags') || "";
            
            let responses = [];
            if (type === 1 || type === 2) {
                let response = interaction.options.getString('response', true);
                console.log(response);
                responses = response.trim().split(';;').map(response => response.trim()); // Remove any leading/trailing whitespace and then split by ';;'
                responses = responses.filter(response => response !== ''); // Remove any empty responses
            }
            console.log(interaction.options);
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

            const newTrigger = {
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
                firedLastAt: firedLastAt
            }
            data.Triggers.push(newTrigger);
            await data.save();

            let responsesFormatted = responses.map((response, index) => `${index + 1}. ${response}`).join('\n');
            client.succNormal({
                text: `Le mot est ajouté à la liste des trigger!`,
                fields: [
                    {
                        "name": `💬┆ Trigger`,
                        "value": `⠀\n✅ \`${alias}\`\n⠀`
                    },
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
        }
    } catch (error) {
        console.error(error);
        // Handle error
    }
}