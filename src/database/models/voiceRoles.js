const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    VoiceChannel: String,
    Role: String
});

module.exports = mongoose.model('voiceRoles', Schema);