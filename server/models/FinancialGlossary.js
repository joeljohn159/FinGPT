// const mongoose = require('mongoose');


// const financialGlossarySchema = new mongoose.Schema({
//     term: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     definition: {
//         type: String,
//         required: true,
//     },
//     category: {
//         type: String,
//         required: false,
//     },
// });

// const FinancialGlossary = mongoose.model('FinancialGlossary', financialGlossarySchema);

// module.exports = FinancialGlossary;


const mongoose = require('mongoose');

const financialGlossarySchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    definition: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: false,
        trim: true,
    },
    example: {
        type: String,
        required: false,
        trim: true,
    },
    synonyms: {
        type: [String],
        required: false,
        default: [],
    },
    resourceLinks: {
        type: [{
            type: {
                type: String,
                required: true,
                enum: ['YouTube', 'Website', 'Blog', 'Article', 'Other'], // Restrict to common types
            },
            title: {
                type: String,
                required: true,
                trim: true,
            },
            url: {
                type: String,
                required: true,
                trim: true,
            },
        }],
        required: false,
        default: [],
    },
});

// Explicitly set the collection name to 'financialGlossaries'
const FinancialGlossary = mongoose.model('FinancialGlossary', financialGlossarySchema, 'financialGlossaries');

module.exports = FinancialGlossary;