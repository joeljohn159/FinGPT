const mongoose = require('mongoose');


const financialGlossarySchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
    },
    definition: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
    },
});

const FinancialGlossary = mongoose.model('FinancialGlossary', financialGlossarySchema);

module.exports = FinancialGlossary;
