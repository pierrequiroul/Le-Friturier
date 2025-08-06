const chalk = require('chalk');

class StatisticsManager {
    constructor() {
        // Ensure the API URL has a protocol
        const baseUrl = process.env.STATS_API_URL || 'http://localhost:3000/api';
        this.API_BASE_URL = baseUrl.startsWith('http://') || baseUrl.startsWith('https://')
            ? baseUrl
            : `http://${baseUrl}`;

        console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), chalk.green('Using API URL:'), chalk.yellow(this.API_BASE_URL));

        // Set up fetch
        this.fetch = global.fetch;
        try {
            this.fetch = require('node-fetch');
            console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), chalk.green('Using node-fetch'));
        } catch {
            console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), chalk.yellow('Using global fetch'));
        }

        // Error management
        this.lastErrorTime = 0;
        this.errorCount = 0;
        this.ERROR_THRESHOLD = 5; // Number of errors before reducing logging
        this.ERROR_TIMEOUT = 5 * 60 * 1000; // 5 minutes between full error logs
    }

    handleError(error, context) {
        const now = Date.now();
        this.errorCount++;

        // Si c'est la première erreur ou si on a dépassé le délai d'attente
        if (this.errorCount === 1 || (now - this.lastErrorTime) > this.ERROR_TIMEOUT) {
            this.lastErrorTime = now;
            
            // Format du message d'erreur selon le type
            let errorMessage = 'An error occurred';
            if (error.code === 'ECONNREFUSED') {
                errorMessage = `Cannot connect to statistics API at ${this.API_BASE_URL}. Is the server running?`;
            } else if (error.type === 'system') {
                errorMessage = `System error: ${error.message}`;
            } else {
                errorMessage = error.message || 'Unknown error';
            }

            console.error(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), 
                chalk.red(errorMessage), 
                this.errorCount > this.ERROR_THRESHOLD ? chalk.yellow('(Further errors will be rate limited)') : '');
            
            if (this.errorCount === 1) {
                console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), 
                    chalk.yellow('Check if the statistics server is running and the URL is correct in .env'));
            }
        }
    }

    async trackAllVoiceActivity(client) {
        if (this.errorCount === 0) {
            //console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), chalk.green('Starting voice activity tracking...'));
        }

        for (const [guildId, guild] of client.guilds.cache) {
            const voiceChannels = guild.channels.cache.filter(
                channel => channel.type === 2 && channel.members.size > 0 // 2 is GUILD_VOICE
            );

            // Préparer les données pour tous les canaux vocaux du serveur
            const channels = [];
            
            for (const [channelId, channel] of voiceChannels) {
                const members = channel.members.map(member => ({
                    memberId: member.id,
                    username: member.user.username
                }));

                channels.push({
                    channelId: channelId,
                    channelName: channel.name,
                    members: members
                });
            }

            // Envoyer toutes les données des canaux vocaux du serveur en une seule requête
            if (channels.length > 0) {
                try {
                    await this.fetch(`${this.API_BASE_URL}/voice/${guildId}`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.STATS_API_KEY
                         },
                        body: JSON.stringify({ channels })
                    });
                    
                    if (this.errorCount > 0) {
                        // Si on réussit après des erreurs, on réinitialise les compteurs
                        this.errorCount = 0;
                        this.lastErrorTime = 0;
                        //console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), 
                            //chalk.green('Connection restored to statistics API'));
                    }

                    if (this.errorCount === 0) {
                        const totalMembers = channels.reduce((total, channel) => total + channel.members.length, 0);
                        //console.log(chalk.blue(chalk.bold('Statistics')), chalk.white('>>'), 
                            //chalk.green('Tracked voice activity for'), chalk.red(guild.name), 
                            //chalk.green('with'), chalk.red(channels.length), chalk.green('channels and'), 
                            //chalk.red(totalMembers), chalk.green('total members'));
                    }
                } catch (error) {
                    this.handleError(error, 'voice activity');
                }
            }
        }
    }
}

// Create the manager instance and prepare exports
let manager = new StatisticsManager();

function handlerExport(client) {
    client.statistics = manager;
    return {
        trackAllVoiceActivity: () => manager.trackAllVoiceActivity(client)
    };
}

// Set up all exports
handlerExport.StatisticsManager = StatisticsManager;
handlerExport.createManager = () => new StatisticsManager();

// Export the handler function
module.exports = handlerExport;