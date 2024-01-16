const mongoose = require('mongoose')

const connectToDatabase = (uri) => {
    mongoose.connect(uri);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
    console.log('Connected to MongoDB');
    });
}
module.exports = {
    connectToDatabase
}