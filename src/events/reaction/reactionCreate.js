const Discord = require("discord.js");

const Functions = require("../../database/models/functions");
const messagesSchema = require("../../database/models/messages");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const triggerWords = ['banana', 'fire', 'white'];

client.on('messageCreate', (message) => {
  if (message.author.bot) return false;

  triggerWords.forEach((word) => {
    if (message.content.includes(word)) {
      message.reply(message.content);
    }
  });
});

