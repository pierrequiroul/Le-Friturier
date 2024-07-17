const Discord = require('discord.js');
const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

module.exports = async (client) => {
    const filesizeLimit = {
        default: 25 * 1024 * 1024 - 1000,
        tier2: 50 * 1024 * 1024 - 1000,
        tier3: 500 * 1024 * 1024 - 1000
    };

    let cooldown_users = new Set();
    let supress_embeds = new Set();
    
    var embed_colour = [158, 200, 221];

    client.on(Discord.Events.MessageCreate, async (message) => {
        if (!message.content || message.author.bot || cooldown_users.has(message.author.id)) return;

        let found_match = false;

        const urls = Array.from(new Set(message.content.match(urlRegex())))
            .slice(0, config.MAX_LINKS_PER_MESSAGE);

        for (const url of urls) {
            if (/(www\.tiktok\.com)|(vm\.tiktok\.com)|(vt\.tiktok\.com)/.test(url) ||
                /(www\.instagram\.com\/reel\/)|(www\.instagram\.com\/reels\/)/.test(url)) {

                cooldown_users.add(message.author.id);
                found_match = true;
                const loadingMessage = await message.reply({ content: "Processing your video, please wait..." });

                try {
                    const videoMetadatas = await get_video_url(url);
                    const direct_url = videoMetadatas.formats[0].url;
                    await process_video_url(message, url, direct_url);
                    loadingMessage.delete(); // Remove loading message after processing
                } catch (err) {
                    report_error(message, url, err);
                }
            } else if (config.EMBED_TWITTER_VIDEO && /\Wtwitter\.com\/.+?\/status\//.test(url)) {
                execFile("gallery-dl", ["-g", url], (error, stdout, stderr) => {
                    if (error) return;
                    if (/\.mp4/.test(stdout)) reply_video(message, stdout);
                });
            }
        };

        if (found_match) {
            if (message.embeds.length) {
                if (message.guild.members.me.permissionsIn(message.channel).has("ManageMessages")) {
                    message.suppressEmbeds().catch(console.error);
                }
            } else {
                supress_embeds.add(message.id);
            }

            (async (id = message.id) => {
                await new Promise((x) => setTimeout(x, 10000));
                supress_embeds.delete(id);
            })();

            (async (id = message.author.id) => {
                await new Promise((x) => setTimeout(x, config.COOLDOWN_PER_USER));
                cooldown_users.delete(id);
            })();
        }
    }).setMaxListeners(0);

    function embed_message(title, desc) {
        return new Discord.EmbedBuilder()
            .setColor(embed_colour)
            .setTitle(title)
            .setDescription(desc)
            .setTimestamp();
    }

    client.on("messageUpdate", (old_message, new_message) => {
        if (!supress_embeds.has(new_message.id)) return;

        if (!old_message.embeds.length && new_message.embeds.length) {
            if (new_message.guild.members.me.permissionsIn(new_message.channel).has("ManageMessages")) {
                new_message.suppressEmbeds().catch(console.error);
            }
            supress_embeds.delete(new_message.id);
        }
    });

    async function get_video_url(url) {
        let options;
        if (/(www\.instagram\.com\/reel\/)/.test(url)) {
            options = url;
        } else if (/(www\.youtube\.com\/shorts\/)/.test(url)) {
            options = [url, "-f", "best"];
        } else {
            options = ["-f", "best[vcodec=h264]", "--extractor-args 'tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com'", url];
        }
        return await ytDlpWrap.getVideoInfo(options);
    }

    async function compress_direct_url(inputUrl, maxFileSize) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(__dirname, '..', '..', 'assets', 'utils', 'temp', 'compressed_output.mp4');
    
            ffmpeg(inputUrl)
                .outputOptions([
                    '-c:v libx264',       // Use H.264 codec for video
                    '-c:a aac',           // Use AAC codec for audio
                    '-b:v 1M',            // Set the video bitrate to 1M
                    '-b:a 128k',          // Set the audio bitrate to 128k
                    '-movflags faststart', // Ensure the file is streamable
                ])
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .save(outputPath);
        });
    }

    function is_too_large_attachment(guild, stream) {
        let limit = filesizeLimit.default;
        if (guild) {
            switch (guild.premiumTier) {
                case 2:
                    limit = filesizeLimit.tier2;
                    break;
                case 3:
                    limit = filesizeLimit.tier3;
                    break;
            }
        }
        const too_large = stream.data.length >= limit;
        return { too_large, limit };
    }

    async function axiosGetWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                    responseType: 'arraybuffer',
                });
                return response;
            } catch (err) {
                if (i === retries - 1 || (err.response && err.response.status === 403)) {
                    throw err;
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before retrying
            }
        }
    }
    
    async function process_video_url(message, url, direct_url) {
        const instance = axios.create({
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            responseType: 'arraybuffer',
        });
    
        try {
            const axios_response = await instance.get(direct_url);
            let { too_large, limit } = is_too_large_attachment(message.guild, axios_response);
    
            if (!too_large) {
                reply_video(message, axios_response.data);
            } else {
                await info_filesize_large(message, url);
                const compressedPath = await compress_direct_url(direct_url, limit / (1024 * 1024) - 1);
                const compressed_response = await axios.get(compressedPath, { responseType: 'arraybuffer' });
                reply_video(message, compressed_response.data);
            }
        } catch (err) {
            if (err.response && err.response.status === 403) {
                report_error(message, url, 'Access denied. Unable to download the video.');
            } else {
                report_error(message, url, err.message || err.toString());
            }
        }
    }
    

    function reply_video(message, videoBuffer) {
    
        const attachment = new AttachmentBuilder(videoBuffer, { name: `${Date.now()}.mp4` });
    
        const components = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Voir le Tiktok')
                    .setURL('http://google.com')
            );
    
        message.reply({
            files: [attachment],
            components: [components]
        }).catch(console.error);
    }
    

    async function info_filesize_large(message, url) {
        const embed = embed_message("File is being Compressed", `${url}\n\nThe video was too big, so just wait.\nIt might take a while :)`);
        const sentMessage = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

        setTimeout(() => {
            sentMessage.delete().catch(console.error);
        }, 60000);
    }

    function report_error(message, url, error) {
        const embed = embed_message("Error", `${url}\n\nThere was a problem trying to download this video :( \n\nLogs:\n\`${error}\``);
        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } }).catch(console.error);
    }

    function report_filesize_error(message) {
        const embed = embed_message("File limit Exceeded", "Uh oh! This video exceeds the file limit Discord allows :/");
        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } }).catch(console.error);
    }

    function rgbToInt(r, g, b) {
        return (r << 16) + (g << 8) + b;
    }
    
    function embed_message(title, desc) {
        const embed_layout = new EmbedBuilder()
            .setColor(rgbToInt(158, 200, 221))  // Convert RGB array to integer
            .setTitle(title)
            .setDescription(desc)
            .setTimestamp();
        return embed_layout;
    }
    
};
