const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Trigger: String,
    Regex: String,
    Response: String,
    Active: { type: Boolean, default: true }
});

module.exports = mongoose.model("triggers-words", Schema);

/*
const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Words: Array
});

module.exports = mongoose.model("blacklist-words", Schema);
*/