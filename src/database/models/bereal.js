const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Enabled: { type : Boolean, default : true},
    Timelimit: { type : Number, default : 120},
    LastFiredOfficial: { type : Number, default : 1677846583},
    LastFiredLocal: { type : Number, default : 1677846583},
    LatestThread: { type : String, default : 0},
    RecapMessages: [ String ],
    Participants: [ String ],
    PostChannel: String,
    NotifChannel: String,
    Region: { type : String, default : "europe-west"},
});

module.exports = mongoose.model("bereal", Schema);