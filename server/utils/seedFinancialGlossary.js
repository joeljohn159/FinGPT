const mongoose = require('mongoose');
const FinancialGlossary = require('../models/FinancialGlossary');

const glossaryTerms = [
    { term: "Tax Deduction", definition: "Tax deductions reduce your taxable income and lower the taxes you owe.", category: "Taxes" },
    { term: "Investment", definition: "Investment involves allocating money to assets or ventures that have the potential to generate returns over time.", category: "General Finance" },
    { term: "Mortgage", definition: "A mortgage is a loan used to purchase a property, where the property itself serves as collateral for the loan.", category: "Loans" },
    { term: "Credit Score", definition: "A credit score is a numerical representation of your creditworthiness, based on your credit history and borrowing behavior.", category: "Credit" },
    { term: "Compound Interest", definition: "Compound interest refers to the interest on a loan or deposit that is calculated based on both the initial principal and the accumulated interest.", category: "Investments" },
    { term: "401(k)", definition: "A 401(k) is a tax-advantaged retirement savings plan offered by employers.", category: "Retirement" },
    { term: "Mutual Fund", definition: "A mutual fund is an investment vehicle that pools together money from multiple investors to purchase securities like stocks, bonds, and other assets.", category: "Investments" },
    { term: "Dividend", definition: "A dividend is a payment made by a corporation to its shareholders, typically in the form of cash or stock.", category: "Investments" },
    { term: "Bond", definition: "A bond is a fixed income instrument that represents a loan made by an investor to a borrower, typically a corporation or government.", category: "Investments" },
    { term: "Capital Gains", definition: "Capital gains are the profits from the sale of an asset like stocks or real estate.", category: "Investments" },
    { term: "Inflation", definition: "Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power.", category: "Economics" },
    { term: "Stock Market", definition: "The stock market is a platform where investors buy and sell shares of companies.", category: "Investments" },
    { term: "Real Estate", definition: "Real estate refers to property consisting of land and the buildings on it, along with its natural resources.", category: "Investments" },
    { term: "Annuity", definition: "An annuity is a financial product that pays out a fixed stream of payments to an individual, typically used as an income stream in retirement.", category: "Retirement" },
    { term: "Diversification", definition: "Diversification is a risk management strategy that mixes a wide variety of investments within a portfolio.", category: "Investments" },
    { term: "Asset Allocation", definition: "Asset allocation refers to the process of dividing investments among different asset categories, such as stocks, bonds, and real estate.", category: "Investments" },
    { term: "Credit Report", definition: "A credit report is a detailed record of an individual's credit history and current credit status.", category: "Credit" },
    { term: "Bankruptcy", definition: "Bankruptcy is a legal proceeding involving a person or business that is unable to repay outstanding debts.", category: "Debt" },
    { term: "Personal Loan", definition: "A personal loan is a type of unsecured loan issued to individuals based on their creditworthiness.", category: "Loans" },
    { term: "Debt-to-Income Ratio", definition: "Debt-to-income ratio is a measure of an individual's monthly debt payments in relation to their gross monthly income.", category: "Credit" },
    { term: "FICO Score", definition: "FICO score is a type of credit score created by the Fair Isaac Corporation, used by lenders to assess credit risk.", category: "Credit" },
    { term: "Tax Filing", definition: "Tax filing is the process of submitting tax returns to the tax authorities.", category: "Taxes" },
    { term: "Capital Loss", definition: "Capital loss occurs when an asset is sold for less than its purchase price.", category: "Investments" },
    { term: "Emergency Fund", definition: "An emergency fund is a reserve of cash set aside for unexpected financial emergencies.", category: "Personal Finance" },
    { term: "Credit Card", definition: "A credit card is a payment card that allows users to borrow funds to pay for purchases, typically with the requirement to pay it back later.", category: "Credit" },
];

const seedDatabase = async () => {
    await mongoose.connect('UPDATE WITH YOUR DB URI/financialGlossary', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await FinancialGlossary.insertMany(glossaryTerms);
        console.log('Glossary terms added to the database!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
    }
};


seedDatabase();
