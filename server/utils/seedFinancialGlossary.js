const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FinancialGlossary = require('../models/FinancialGlossary');

const seedDatabase = async () => {
    await mongoose.connect('mongodb+srv://admin:admin@fingpt.h3xeq.mongodb.net/?retryWrites=true&w=majority&appName=finGPT/financialGlossary', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        // Step 1: Delete existing entries
        await FinancialGlossary.deleteMany({});
        console.log('Existing glossary terms deleted.');

        // Step 2: Load new data from JSON file
        const filePath = path.join(__dirname, 'financial_glossary_seed_data_250.json');
        const glossaryTerms = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Step 3: Insert new entries
        await FinancialGlossary.insertMany(glossaryTerms);
        console.log(`${glossaryTerms.length} glossary terms added to the database!`);
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
