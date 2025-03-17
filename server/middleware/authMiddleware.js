//VALIDATE JWT TOKEN
const { JWT_SECRET, JWT_EXP } = require('../config/auth');

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Auth Token Required' })
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });

}

module.exports = { authMiddleware }