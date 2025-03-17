const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware.js')
const { startSession, addMessage, getAllUserHistory } = require('../controllers/conversationController');
const router = express.Router();



router.post('/start-session', authMiddleware, startSession);


router.post('/add-message', authMiddleware, addMessage);


router.get('/history', authMiddleware, getAllUserHistory);


module.exports = router;
