//VALIDATE JWT TOKEN
const { JWT_SECRET, JWT_EXP } = require('../config/auth');

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Auth Token Required' })
    }

    try {
        const decodeToken = jwt.verify(token, JWT_SECRET);
        req.user = decodeToken
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
}

module.exports = authMiddleware;