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


module.exports = { login, signup }