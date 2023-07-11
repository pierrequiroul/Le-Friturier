const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Animal: {
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    },
    Influence: [{
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    }],
    Cinema: [{
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    }],
    Talk: [{
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    }],
    Music: [{
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    }],
    Hunter: [{
        ChannelId: { type : String, default: "Global"},
        Type: { type : String, default: "MPLC"}
    }]
});

module.exports = mongoose.model("badge-channels", Schema);