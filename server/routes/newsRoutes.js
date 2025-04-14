const express = require('express');
const { getNews } = require('../controllers/newsController.js');
const { authMiddleware } = require('../middleware/authMiddleware.js')
const router = express.Router();

// Route to fetch news
router.get('/news', authMiddleware, getNews);

module.exports = router;
