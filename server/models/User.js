// //Create User model

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: false,
//         trim: true
//     },

//     password: {
//         type: String,
//         required: true,
//         minlength: 6
//     },


// }, { timestamps: true });


// const User = mongoose.model('User', userSchema);

// module.exports = User;

const mongoose = require('mongoose');

// Create User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    firstName: {
        type: String,
        required: false,
    },

    lastName: {
        type: String,
        required: false,
    },

    age: {
        type: Number,
        required: false,
    },

    bio: {
        type: String,
        maxlength: 500,
    },

    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String },
    },

    phoneNumber: {
        type: String,
        match: [/^\d{10}$/, 'Please provide a valid phone number'],
    },

    dateOfBirth: {
        type: Date,
    },

    socialLinks: {
        twitter: { type: String },
        linkedin: { type: String },
        github: { type: String },
    },

    role: {
        type: String,
        default: 'user',
    },
}, { timestamps: true });


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
