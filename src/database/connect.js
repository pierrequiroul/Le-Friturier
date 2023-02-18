/*const mongoose = require('mongoose');
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
}

module.exports.connect = connect;*/

const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_TOKEN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const collection = mongoose.connection.db.collection("triggers-words");
        return new Promise((resolve, reject) => {
            collection.find({}).toArray(function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    } catch (err) {
        console.error(chalk.red.bold("Failed to connect to MongoDB:"));
        console.error(err);
        process.exit(1);
    }
}

module.exports.connect = connect;