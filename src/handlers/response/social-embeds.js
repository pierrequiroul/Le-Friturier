const Discord = require('discord.js');
const axios = require('axios');
const path = require('path');
const ytDlpPath = path.join(__dirname, '..', '..', 'assets', 'utils', 'yt-dlp');
const config = {
    "COOLDOWN_PER_USER": 7500,
    "MAX_LINKS_PER_MESSAGE": 5,
    "YT_DLP_PATH": ytDlpPath,
    "EMBED_TWITTER_VIDEO": false,
    "BOOSTED_CHANNEL_ID": ""
  };
const urlRegex = require("url-regex-safe");
const { execFile } = require("child_process");
const YTDlpWrap = require("yt-dlp-wrap").default;
const ytDlpWrap = new YTDlpWrap(config.YT_DLP_PATH);
const ffmpeg = require('fluent-ffmpeg');

/*
  fix first response
  send temp reponse loading
  social media personnalisation

*/


module.exports = async (client) => {
    const filesizeLimit = {
        default: 25 * 1024 * 1024 - 1000, // reserve 1KB for the message body
        tier2: 50 * 1024 * 1024 - 1000,
        tier3: 500 * 1024 * 1024 - 1000
    };
    
    let cooldown_users = new Set();
    let supress_embeds = new Set();
    
    // Setting colour of embed message
    var embed_colour = [158, 200, 221];

    client.on(Discord.Events.MessageCreate, async (message) => {
        if (!message.content || message.author.bot || cooldown_users.has(message.author.id))
        return;
    let found_match = false;

    const urls = Array.from(new Set(message.content.match(urlRegex())))
    .slice(0, config.MAX_LINKS_PER_MESSAGE);

    // Convert to set to remove duplicates and then back to array to be able to slice (slicing so max config.MAX_TIKTOKS_PER_MESSAGE tiktoks per message)
    for (const url of urls) {
            if (
                /(www\.tiktok\.com)|(vm\.tiktok\.com)|(vt\.tiktok\.com)/.test(url) || 
                /(www\.instagram\.com\/reel\/)/.test(url) ||
                /(www\.youtube\.com\/shorts\/)/.test(url)
            ) {
                cooldown_users.add(message.author.id);
                found_match = true;
                message.channel.sendTyping().catch(console.error);

                try {
                    const videoMetadatas = await get_video_url(url);
                    const direct_url = videoMetadatas.formats[0].url;
                    await process_video_url(message, url, direct_url);
                } catch (err) {
                    report_error(message, url, err);
                }
            } else if (
                config.EMBED_TWITTER_VIDEO &&
                /\Wtwitter\.com\/.+?\/status\//.test(url)
            ) {
                execFile("gallery-dl", ["-g", url], (error, stdout, stderr) => {
                    if (error) return;
                    if (/\.mp4/.test(stdout)) reply_video(message, stdout);
                });
            }
        };

    if (found_match) {
        // If the embed has already been generated, it'll immediately appear with the message
        // otherwise we need to wait for the embed to appear in 'messageUpdate' event
        if (message.embeds.length) {
            if (
                message.guild.members.me
                    .permissionsIn(message.channel)
                    .has("ManageMessages")
            )
                message.suppressEmbeds().catch(console.error);
        } else supress_embeds.add(message.id);

        // If the embed hasn't appeared in 10 seconds, lets assume it'll never appear
        // and clear the message id from `supress_embeds`
        (async (id = message.id) => {
            await new Promise((x) => setTimeout(x, 10000));
            supress_embeds.delete(id);
        })();

        // Very basic cooldown implementation to combat spam.
        // removes user id from set after cooldown_per_user ms.
        (async (id = message.author.id) => {
            await new Promise((x) => setTimeout(x, config.COOLDOWN_PER_USER));
            cooldown_users.delete(id);
        })();
    }
    }).setMaxListeners(0);

    // Setting layout of embed message
    function embed_message(title, desc) {
        const embed_layout = new Discord.EmbedBuilder()
            .setColor(embed_colour)
            .setTitle(title)
            .setDescription(desc)
            .setTimestamp();
        return embed_layout;
    }

    client.on("messageUpdate", (old_message, new_message) => {
        if (!supress_embeds.has(new_message.id)) return;

        //if one or more embeds appeared in this message update
        if (!old_message.embeds.length && new_message.embeds.length) {
            if (
                new_message.guild.members.me
                    .permissionsIn(new_message.channel)
                    .has("ManageMessages")
            )
                new_message.suppressEmbeds().catch(console.error);
            supress_embeds.delete(new_message.id);
        }
    });
    // PROCESSING
    // Sends link to ytdl to get raw video url
    async function get_video_url(url) {
        let options;
        if (/(www\.instagram\.com\/reel\/)/.test(url)) {
            options = url;
        } else if (/(www\.youtube\.com\/shorts\/)/.test(url)) {
            options = [url, "-f", "best"];
        } else {
            options = [url, "-f", "best[vcodec=h264]"];
        }
        let metadata = await ytDlpWrap.getVideoInfo(options);
        return metadata;
    }

    // Sends raw video url to 8mb.video for compression
    async function compress_direct_url(inputPath, maxFileSize) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(__dirname, '..', '..', 'assets', 'utils', 'temp', 'compressed_output.mp4');
    
            ffmpeg(inputPath)
                .videoCodec('libx264')  // Set the video codec to H.264
                .outputOptions(`-b:v ${Math.floor(maxFileSize * 1024 * 0.5)}`)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .save(outputPath);
        });
    }

    // Checks the size of the video
    function is_too_large_attachment(guild, stream) {
        let limit = 0;
        if (!guild) limit = filesizeLimit.default;
        else {
            switch (guild.premiumTier) {
                default:
                case 1:
                    limit = filesizeLimit.default;
                    break;
                case 2:
                    limit = filesizeLimit.tier2;
                    break;
                case 3:
                    limit = filesizeLimit.tier3;
                    break;
            }
        }
        out = stream.data.length >= limit;
        out.limit = limit;
        return out;
    }

    // Process the video from url
    async function process_video_url(message, url, direct_url) {
        const instance = axios.create({
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            responseType: 'arraybuffer', // set the responseType directly
        });
    
        try {
            const axios_response = await instance({
                method: 'get', // specify the HTTP method
                url: direct_url,
            });

            let too_large = is_too_large_attachment(message.guild, axios_response);
            if (!too_large) {
                reply_video(message, axios_response.data);
            }
            
            /*let too_large = is_too_large_attachment(message.guild, axios_response);
    
            if (too_large && !config.BOOSTED_CHANNEL_ID) {
                // no channel set from which to borrow file size limits
                info_filesize_large(message, url);
                await compress_direct_url(direct_url, 24);
                const compressed_url = path.join(__dirname, '..', '..', 'assets', 'utils', 'temp', 'compressed_output.mp4');
                reply_video(message, compressed_url);
            } else if (too_large) {
                const channel = await client.channels.fetch(config.BOOSTED_CHANNEL_ID);
                if (is_too_large_attachment(channel.guild, axios_response)) {
                    report_filesize_error(message);
                } else {
                    const boosted_message = await channel.send({
                        files: [
                            {
                                attachment: axios_response.data,
                                name: `${Date.now()}.mp4`,
                            },
                        ],
                    });
    
                    message.reply({
                        content: boosted_message.attachments.first().attachment,
                        allowedMentions: {
                            repliedUser: false,
                        },
                    }).catch(console.error);
                }
            } else {
                reply_video(message, axios_response.data);
            }*/
        } catch (err) {
            report_error(message, url, err); // if the request failed
        }
    }
    


    // MESSAGES
    // Reply with video
    function reply_video(message, video) {
        let generatedEmbeds =
            {
                "type": "rich",
                "title": "sdsd",
                "url": ``,
                "description": "sd",
                "color": "ffffff",
                "fields": [
                    {
                        "name": "Auteur",
                        "value": "sd",
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
                    "url": "",
                    "height": 1,
                    "width": 1
                },
                "footer": {
                    "text": ""
                  },
                "timestamp": ""
            };

        let repond = [
            {
                "content": "",
                //"allowedMentions": { "repliedUser": true },
                "tts": false,
                "embeds": generatedEmbeds
            },
            {
                "content": "",
                "tts": false,
                "files": [
                    {
                        "attachment": video,
                        "name": `${Date.now()}.mp4`,
                    },
                ],
                "components": [
                    {
                        "type": 1,
                        "components": [
                            {
                            "style": 5,
                            "label": `Voir le Tiktok`,
                            "url": "http://google.com",
                            "disabled": false,
                            "type": 2
                            }
                        ]
                    }
                ]
            }
        ]

        message.reply(repond[0]).catch(console.error); 
        message.reply(repond[1]).catch(console.error); // if sending of the Discord message itself failed, just log error to console

        
    }

    // Reply that video is being compressed then delete is after 50 seconds
    async function info_filesize_large(message, url) {
        title_message = "File is being Compressed";
        desc_message = `${url}\n\nThe video was too big, so just wait.\nIt might take a while :)`;
        message.reply({
            embeds: [embed_message(title_message, desc_message)],
            allowedMentions: { repliedUser: false },
        })
            .then((sentMessage) => {
                setTimeout(() => {
                    sentMessage.delete();
                }, 60000);
            })
            .catch(console.error);
    }

    // Error reply messages
    function report_error(message, url, error) {
        title_message = "Error";
        desc_message = `${url}\n\nThere was a problem trying to download this video :( \n\nLogs:\n\`${error}\``;
        console.log(error);
        message.reply({
            embeds: [embed_message(title_message, desc_message)],
            allowedMentions: { repliedUser: false },
        }).catch(console.error);
    }

    function report_filesize_error(message) {
        title_message = "File limit Exceeded";
        desc_message = "Uh oh! This video exceeds the file limit Discord allows :/";
        message.reply({
            embeds: [embed_message(title_message, desc_message)],
            allowedMentions: { repliedUser: false },
        }).catch(console.error);
    }
    /*client.on(Discord.Events.MessageCreate, async (message) => {
        if (message.channel.type === Discord.ChannelType.DM) return;
        if (message.author.bot) return;


            
            
            message.delete({ timeout: 5000 });
            message.channel.send(embed);
            // Delete the original message

    }).setMaxListeners(0);*/
};



// sdsd





