const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
    mongoose.connect(process.env.MONGO_TOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    return new Promise((resolve, reject) => {
        const collection = mongoose.connection.db.collection("triggers-words");
        collection.find({}).toArray(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    
    return data;
}

module.exports.connect = connect;
module.exports.triggerWords = connect();