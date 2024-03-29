const { CommandInteraction, Client } = require('discord.js');
const { ContextMenuCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');

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
    const user = interaction.member.user;
    const member = interaction.member;
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'Tu ne possèdes pas la permission requise \`Gérer les messages\` pour effectuer cette action ', ephemeral: true });
    }
    await interaction.reply({
      "content": ' ',
      "embeds": [
        {
          "type": "rich",
          "title": "",
          "description": `Ajoute un contexte pour mieux décrire le spoiler ou écris \`annuler\``,
          "color": 0x00FFFF
        }
      ]/*,
      "components": [
            {
              "style": 4,
              "label": `Cancel`,
              "custom_id": `Cancel`,
              "disabled": false,
              "type": 1
            }
          ]*/
    });

    const filter = m => m.author.id === user.id;
    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async m => {
      if (m.content.trim().toLowerCase() === 'annuler') {
        interaction.editReply({ content: 'Tu as annulé la mise en spoiler du message !', ephemeral: true });
        m.delete();
        return;
      }


      const context = m.content.trim();
      var files = undefined;
    if(message.attachments.size > 0) {
    var imageUrl = "";
      const firstAttachment = message.attachments.first();
      if (firstAttachment) {
        const attachmentUrl = firstAttachment.url;
        const originalFilename = firstAttachment.name;
        const renamedFilename = "SPOILER_" + originalFilename;
        const tempFilePath = `./${originalFilename}`;
        const newFilePath = `./${renamedFilename}`;
    
        try {
          // Download the file locally
          await downloadFile(attachmentUrl, tempFilePath);
  
          // Rename the file
          fs.renameSync(tempFilePath, newFilePath);
          const guild = client.guilds.cache.get('355051708503687168'); // Replace with your guild ID
          const channel = guild.channels.cache.get('819916307951648839'); // Replace with your channel ID
          
          // Upload the renamed file to Discord
        const uploadedMessage = await channel.send({
          files: [newFilePath],
          content: "Automatic upload of an image turned into a spoiler"
        });
        console.log('File uploaded. Generated URL:', imageUrl);
        files = [{
          attachment: uploadedMessage.attachments.first().url,
          name: renamedFilename
       }];
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        // Delete the temporary files
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        if (fs.existsSync(newFilePath)) {
          fs.unlinkSync(newFilePath);
        }
      }
    } else {
      console.log('No attachments found.');
    }
  }
  const timestamp = message.createdTimestamp;
  const date = new Date(timestamp);
  const isoTimestamp = date.toISOString();
  if (message.content == null || message.content == "") {
    var fields = [
      {
        "name": ``,
        "value": `**${message.author}** a posté une image spoiler à propos de **${context}**\n`
      },
      {
        "name": ``,
        "value": ` `
      }
    ]
  } else {
    var fields = [
      {
        "name": ``,
        "value": `**${message.author}** a écris un spoiler à propos de **${context}**\n`
      },
      {
        "name": ``,
        "value": `> ||${message.content}||`
      }
    ]
  }
    // https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp
      embed = {
        "channel_id": message.channel_id,
        "content": ``,
        "tts": false,
        "files": files,
        "allowedMentions": { repliedUser: false },
        "embeds": [
          {
            "type": "rich",
            "title": ``,
            "description": ``,
            "color": 0x153866,
            "author": {
              "name": "Spoiler",
              "icon_url": `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp`
            },
            "fields": fields,
          "timestamp": isoTimestamp
          }
        ]
      };
    interaction.editReply(embed);
    m.delete();
    message.delete({ timeout: 5000 })
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.followUp({ content: 'Tu n\'as pas fourni le contexte requis. Comment savoir de quoi parle le spoiler sinon?', ephemeral: true });
    }
  });
},
};

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const request = https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(filePath, () => reject(err));
    });
  });
}
