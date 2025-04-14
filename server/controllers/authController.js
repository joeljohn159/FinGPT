const User = require('../models/User');
const authService = require('../services/authService');


//Signup Controller
const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await authService.signup(email, password);
        res.status(201).json({ message: 'User created please login' });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


//Login Controller
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await authService.login(email, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}



const updateProfile = async (req, res) => {
    const { email, firstName, lastName, age, bio, address, phoneNumber, profilePicture, dateOfBirth, socialLinks } = req.body;

    try {

        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                firstName,
                lastName,
                age,
                bio,
                address,
                phoneNumber,
                profilePicture,
                dateOfBirth,
                socialLinks,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { login, signup, updateProfile }