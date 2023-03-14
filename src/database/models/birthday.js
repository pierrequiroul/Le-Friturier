const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    Birthday: String,
    EventID: String,
    Day: Number,
    Month: Number,
    Year: Number,
});

module.exports = mongoose.model("birthday", Schema);