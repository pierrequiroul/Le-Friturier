const mongoose = require('mongoose');
const chalk = require('chalk');

async function populate() {
    const trigWord = mongoose.collection.getCollection("triggers-words");
    
    
    console.log(chalk.blue(trigWord[0].Trigger))
}


module.exports = populate