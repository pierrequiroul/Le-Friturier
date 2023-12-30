const { CommandInteraction, Client } = require('discord.js');
const { ContextMenuCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('[DEV] Debug message in console')
    .setType(3),

  /** 
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const message = args[0].message;
    const user = interaction.member.user;
    const member = interaction.member;
    /*if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'Tu ne possèdes pas la permission requise \`Gérer les messages\` pour effectuer cette action ', ephemeral: true });
    }*/
    message.channel.send("\`\`\`json\n" + message + "\`\`\`");
},
};
