const { CommandInteraction, Client } = require('discord.js');
const { ContextMenuCommandBuilder } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Mettre en spoiler')
    .setType(3),

  /** 
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const message = args[0].message;
    console.log(message.author.username.charAt(0).toUpperCase() + message.author.username.slice(1));
    console.log(message.content);
    console.log(interaction.member.guild.name);
    
    // Send a ephemeral message to with a button to cancel

    // Wait an amount of time and store whatever the user is sending in "subject" variable

    let embed = new Discord.EmbedBuilder()
      .setAuthor({
        name: message.author.username.charAt(0).toUpperCase() + message.author.username.slice(1),
        iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
      })
      .setColor(client.config.colors.normal)
      .setDescription(`\na dis :\n> ||${message.content}||\n`)
      .setFooter({
        text: `Mis en spoiler par ${interaction.user.username}`,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
      })

    interaction.reply({ embeds: [embed] });
    message.delete({ timeout: 5000 })
  },
};