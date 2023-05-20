const Discord = require('discord.js');
const chalk = require('chalk');
const { random } = require('mathjs');

module.exports = async (client) => {
    const startLogs = new Discord.WebhookClient({
        id: client.webhooks.startLogs.id,
        token: client.webhooks.startLogs.token,
    });

    console.log(`\u001b[0m`);
    console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), chalk.red(`Shard #${client.shard.ids[0] + 1}`), chalk.green(`is ready!`))
    console.log(chalk.blue(chalk.bold(`Bot`)), (chalk.white(`>>`)), chalk.green(`Started on`), chalk.red(`${client.guilds.cache.size}`), chalk.green(`servers!`))

    let embed = new Discord.EmbedBuilder()
        .setTitle(`🆙・Finition Shard`)
        .setDescription(`Un éclat vient de terminer`)
        .addFields(
            { name: "🆔┆ID", value: `${client.shard.ids[0] + 1}/${client.options.shardCount}`, inline: true },
            { name: "📃┆State", value: `Ready`, inline: true },
        )
        .setColor(client.config.colors.normal)
    startLogs.send({
        username: 'Bot Logs',
        embeds: [embed],
    });

    setInterval(async function () {
        const promises = [
            client.shard.fetchClientValues('guilds.cache.size'),
        ];
        const activities = [
            { name: `League of Legends`, type: 0 },
            { name: `vec ta mère`, type: 0 },
            { name: `si aucune rebellion ne se forme`, type: 3 },
            { name: `le crépitement de la friture`, type: 2 },
            { name: `si Eliott fait pas de bêtises`, type: 3 },
            { name: `si ça joue à LoL`, type: 3 },
            { name: `si Thomas est toujours aussi beau aujourd'hui`, type: 3 },
            { name: `si Lisa casse pas les couilles`, type: 3 },
            { name: `si Diana ne s'est pas trompé de micro (encore)`, type: 2 },
            { name: `si le Megapack est en live`, type: 3 },
        ];
        return Promise.all(promises)
            .then(results => {
                const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                let statuttext;
                if (process.env.DISCORD_STATUS) {
                    statuttext = process.env.DISCORD_STATUS.split(', ');
                } else {
                    statuttext = [
                        { name: `League of Legends`, type: Discord.ActivityType.Competing },
                        { name: `si aucune rebellion ne se forme`, type: Discord.ActivityType.Watching },
                        { name: `le crépitement de la friture`, type: Discord.ActivityType.Listening },
                        { name: `si Eliott fait pas de bêtises`, type: Discord.ActivityType.Watching },
                        { name: `si ça joue à LoL`, type: Discord.ActivityType.Watching },
                        { name: `si Thomas est toujours aussi beau aujourd'hui`, type: Discord.ActivityType.Watching },
                        { name: `${totalGuilds} serveurs`, type: Discord.ActivityType.Watching}
                    ];
                }
                const randomText = statuttext[Math.floor(Math.random() * statuttext.length)];
                client.user.setPresence({ activities: [{ name: randomText.name, type: randomText.type }], status: 'online' });
            })
    }, 50000)

    client.player.init(client.user.id);
}

