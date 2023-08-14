const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Triggers: [{
        isActive: { type : Boolean, default: true},
        alias: { type : String, default: "Alias"},
        type: { type : Number, default: 1},
        regex: { type : String, default: "test"},
        regexFlags: { type: String, default: ""},
        responses: [{ type : String, default: ""}],
        responsesType: { type : Boolean, default: false},
        target: { type : String, default: "All"},
        targetMode: {type : Boolean, default: true},
        salon: { type : String, default: "All"},
        firedTimes: {type : Number, default: 0},
        lastFiredAt: {type : String, default: ""},
        cooldown: {type : Number, default: 0},
        mention: { type : Boolean, default: true},
        replied: { type : Boolean, default: true},
        emotes: { type : Object, default: ""},
        timeDeletion: {type : Number, default: 1000}
    }]
});

module.exports = mongoose.model("triggers", Schema);