const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    User: String,
    FriendlyName: String,
    Animal: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
    Influence: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
    Cinema: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
    Talk: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
    Music: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
    Hunter: [{
        Level: { type : number, default: 0},
        Points: { type : number, default: 0}
    }],
});

module.exports = mongoose.model("badge-users", Schema);