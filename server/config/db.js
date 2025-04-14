const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        const dbURI = process.env.DB_URI;
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('Atlas DB Connected')

    } catch (error) {
        console.log('Failed connecting to Mongo Atlas DB : ', error);
        process.exit(1)
    }
}

module.exports = connectDB;