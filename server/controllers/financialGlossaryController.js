const FinancialGlossary = require('../models/FinancialGlossary');

const getAllGlossary = async (req, res) => {
    try {
        const glossaryTerms = await FinancialGlossary.find({});

        if (glossaryTerms.length === 0) {
            return res.status(404).json({ error: 'No glossary terms found' });
        }

        res.json(glossaryTerms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch glossary terms' });
    }
};
const getAllTerms = async (req, res) => {
    try {
        const terms = await FinancialGlossary.find({});
        const termNames = terms.map(term => term.term);
        res.json({ terms: termNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch terms' });
    }
};


const searchTerm = async (req, res) => {
    const { term } = req.params;

    try {
        const glossaryTerm = await FinancialGlossary.findOne({ term: { $regex: term, $options: 'i' } });

        if (!glossaryTerm) {
            return res.status(404).json({ error: 'Term not found' });
        }

        res.json(glossaryTerm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search for the term' });
    }
};


const getByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const termsByCategory = await FinancialGlossary.find({ category });

        if (termsByCategory.length === 0) {
            return res.status(404).json({ error: 'No terms found for this category' });
        }

        res.json(termsByCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch terms by category' });
    }
};

module.exports = {
    getAllTerms,
    searchTerm,
    getByCategory,
    getAllGlossary
};
