const express = require('express');
const financialGlossaryController = require('../controllers/financialGlossaryController');
const router = express.Router();

router.get('/get-all', financialGlossaryController.getAllGlossary);

router.get('/get-all-terms', financialGlossaryController.getAllTerms);

router.get('/search-term/:term', financialGlossaryController.searchTerm);

router.get('/get-by-category/:category', financialGlossaryController.getByCategory);

module.exports = router;
