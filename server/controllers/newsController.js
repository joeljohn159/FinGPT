const CurrentsAPI = require('currentsapi');
const NEWS_API_KEY = process.env.NEWS_API_KEY
const currentsapi = new CurrentsAPI(NEWS_API_KEY);
require('dotenv').config();

// Controller to fetch news
const getNews = async (req, res) => {
    const { keywords = 'finance', language = 'en', country = 'US' } = req.query;
    try {

        const response = await currentsapi.search({
            keywords: keywords,
            language: language,
            country: country
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error: error.message });
    }
};

module.exports = { getNews };
