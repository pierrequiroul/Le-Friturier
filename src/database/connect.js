const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
    mongoose.connect(process.env.MONGO_TOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    
    
    
    
    
    
    mongoose.connection.once("open", () => {
        console.log(chalk.blue(chalk.bold(`Systeme`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`est prêt !`))
        
        mongoose.connection.db.collection("triggers-words", function(err, collection){
            mongoose.collection.find({}).toArray(function(err, data){
                console.log(data); // it will print your collection data
            })
        });
    });
    
    return;
}


module.exports = connect