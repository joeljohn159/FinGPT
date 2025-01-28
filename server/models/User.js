//Create User model

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: false,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },


}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;
