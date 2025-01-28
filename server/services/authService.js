const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXP } = require('../config/auth');


const signup = async (email, password) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) { throw new Error('User already exist!') }
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error(error.message)
    }
}


const login = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) { throw new Error('User not Found') }
        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            throw new Error('Invalid credentials')
        }

        //JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })

        return token;
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = { signup, login }