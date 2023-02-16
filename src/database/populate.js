const mongoose = require('mongoose');
const chalk = require('chalk');

async function populate() {
    const trigWord = mongoose.Collection("triggers-words");
    
    
    console.log(chalk.blue(trigWord[0].Trigger));
    return;
}


module.exports = populate