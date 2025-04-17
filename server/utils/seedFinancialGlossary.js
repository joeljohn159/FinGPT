const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FinancialGlossary = require('../models/FinancialGlossary');

const seedDatabase = async () => {
    try {
        console.log('Starting seed process...');

        // Connect to the 'test' database
        await mongoose.connect('mongodb+srv://admin:admin@fingpt.h3xeq.mongodb.net/test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Collection:', FinancialGlossary.collection.name);

        // List all collections in the 'test' database for debugging
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in test database:', collections.map(c => c.name));

        // Step 1: Delete existing entries in financialGlossaries
        await FinancialGlossary.deleteMany({});
        console.log('Existing glossary terms deleted from financialGlossaries collection.');

        // Step 2: Load new data from JSON file
        const filePath = path.join(__dirname, 'financial_glossary_seed_data_250.json');
        console.log('Reading JSON from:', filePath);
        let glossaryTerms;
        try {
            glossaryTerms = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (parseErr) {
            throw new Error(`Failed to parse JSON file: ${parseErr.message}`);
        }
        console.log('Parsed terms:', glossaryTerms.length, glossaryTerms.slice(0, 2));

        // Validate JSON data
        if (!Array.isArray(glossaryTerms) || glossaryTerms.length === 0) {
            throw new Error('JSON file is empty or not an array');
        }

        // Step 3: Insert new entries
        await FinancialGlossary.insertMany(glossaryTerms, { ordered: false });
        console.log(`${glossaryTerms.length} glossary terms added to the database!`);

        // Step 4: Verify insertion
        const count = await FinancialGlossary.countDocuments({});
        console.log('Documents in financialGlossaries collection:', count);

        // Step 5: Sample a few documents for verification
        const sampleDocs = await FinancialGlossary.find({}).limit(3);
        console.log('Sample documents:', sampleDocs);
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedDatabase();