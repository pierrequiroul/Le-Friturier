const Devs = require("../../database/models/developers");
const Discord = require('discord.js');
const axios = require('axios');
module.exports = (client) => {
    client.on('ready',() => {
        client.notifyFreebiesChannel = client.channels.cache.get("1018156441883906138");
    });
    client.on(Discord.Events.MessageCreate, async (message) => {
        if (message.channel.type === Discord.ChannelType.DM) return;
        if (message.author.bot) return;
        try {

                const messageStripped = message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
                const regex = new RegExp("test", "gi");
                const args = messageStripped.match(regex);

                if(args) {
                    await notifyFreebiesAndUpdateDate();;
                }
        } catch (err) {
            console.error(err);
        }
    }).setMaxListeners(0);



    const getMarketplaceData = async () => {
        const url = "https://www.unrealengine.com/marketplace/api/assets?lang=en-US&start=0&count=20&sortBy=effectiveDate&sortDir=DESC&tag[]=4910";
        const response = await axios.get(url);
        console.log("Getting Marketplace Data...");
        return response.data;
    };

    const generateMessage = (marketplaceData) => {
        var generatedEmbeds = [];
        var generatedAttachments = [];
        const color = Math.floor(Math.random() * 9999999);
        const timestamp = new Date();
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const month = monthNames[timestamp.getMonth()];
        const year = timestamp.getFullYear().toString();

        for (const element of marketplaceData.data.elements) {
            // var rand = Math.floor(Math.random() * marketplaceData.data.elements.length);
            /*generatedAttachments.push(
                marketplaceData.data.elements[rand].featured
            )*/
            

            /* Ajouter check pour pas dépasser 10 fichiers
                shuffle files
                pas 2 fois le même

            */
            if (element.categories[0].name == "Environments") {
                console.log(element.keyImages[Math.floor(Math.random() * 10)].url.replace(/ /g, '%20'));
                generatedAttachments.push( 
                    {
                    "attachment": element.keyImages[Math.floor(Math.random() * 10)].url.replace(/ /g, '%20'),
                    }
                )
                /*generatedAttachments.push( 
                    {
                    "attachment": element.keyImages[Math.floor(Math.random() * 10)].url.replace(/ /g, '%20'),
                    }
                )*/
            }
            generatedEmbeds.push(
                {
                    "type": "rich",
                    "title": element.title,
                    "url": `https://www.unrealengine.com/marketplace/en-US/product/${element.urlSlug}`,
                    "description": "> ➜  " + element.description,
                    "color": color,
                    "fields": [
                        {
                            "name": "Auteur",
                            "value": `[${element.seller.name}](https://www.unrealengine.com/marketplace/en-US/profile/${element.seller.name.replace(/\s+/g, '+')})`,
                            "inline": true
                        },
                        {
                            "name": "Prix initial",
                            "value": element.price,
                            "inline": true
                        },
                        {
                            "name": "Note",
                            "value": element.rating.averageRating + " sur 5 ★",
                            "inline": true
                        }
                    ],
                    "author": {
                        "name": "",
                        "icon_url": ""
                    },
                    "image": {
                        "url": "",
                        "height": 0,
                        "width": 0
                    },
                    "thumbnail": {
                        "url": element.thumbnail,
                        "height": 1,
                        "width": 1
                    }
                    }
            );

            var generatedComponents = [
                {
                "type": 1,
                "components": [
                    {
                    "style": 5,
                    "label": `Ouvrir la page du Marketplace`,
                    "url": `https://www.unrealengine.com/marketplace/en-US/product/${element.urlSlug}`,
                    "disabled": false,
                    "type": 2
                    },
                    {
                    "style": 5,
                    "label": `Ouvrir l'article du Blog`,
                    "url": `https://www.unrealengine.com/en-US/blog/featured-free-unreal-marketplace-content-${month}-${year}`,
                    "disabled": false,
                    "type": 2
                    }
                ]
                }
            ]
        }

        return [{
            "content": "",
            "tts": false,
            "embeds": generatedEmbeds
        },
        {
            "content": "",
            "tts": false,
            "files": generatedAttachments,
            "components": generatedComponents
        }
    ];
    }

    const sendMessage = async (webhookData) => {
        /*const webhookUrl = "https://discord.com/api/webhooks/1043692710722281473/AXoc36oig4YUOTjH0N0h77YH6SSot46QkmQVVcZH34Zevbs4bVaEHmiZ6VqLUg8gzf7x";
        try {
            const result = await axios.post(webhookUrl, webhookData);
            console.log(`Payload delivered successfully, code ${result.status}.`);
        } catch (error) {
            console.error(error.message);
        }*/
        //const channel = client.channels.cache.get(1018156441883906138);
        client.notifyFreebiesChannel.send(webhookData);
    };

    const notifyFreebiesAndUpdateDate = async () => {
        console.log('Notifying about freebies...');
        // Add your notification logic here
        try {
            const marketplaceData = await getMarketplaceData();
            const messageData = generateMessage(marketplaceData);
            await sendMessage(messageData[0]);
            await sendMessage(messageData[1]);
        } catch (error) {
            console.log("Error sending Unreal Freebies");
            console.log(error);
        }

        // Update the stored date to now + 1 month
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        const getLastDate = await Devs.findOne({ Action: "Freebies" }).exec();

        if (getLastDate) {
            getLastDate.Date = nextMonthDate;
            getLastDate.save();
        }
    };

    const checkFreebies = async () => {
        const currentDate = new Date();
        const lastStoredDate = await Devs.findOne({ Action: "Freebies" }).exec();

        if (lastStoredDate) {
            const storedDate = new Date(lastStoredDate.Date);

            if (storedDate.toISOString() === currentDate.toISOString()) {
                notifyFreebiesAndUpdateDate();
                return;
            }

            lastStoredDate.Date = currentDate;
            lastStoredDate.save();
        } else {
            new Devs({
                Action: "Freebies",
                Date: currentDate,
            }).save();
        }

        setTimeout(checkFreebies, 1000 * 10);
    };

    checkFreebies();
};