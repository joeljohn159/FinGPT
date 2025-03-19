const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware.js')
const { submitFeedback, getUserFeedback } = require('../controllers/feedbackController.js');

const router = express.Router();


router.post('/submit', authMiddleware, submitFeedback);

router.get('/user', authMiddleware, getUserFeedback);

module.exports = router;
