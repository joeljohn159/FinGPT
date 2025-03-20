import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './../styles/FinancialGlossary.css';

function FinancialGlossary() {
    const [terms, setTerms] = useState([]);
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState(null);


    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial-glossary/get-all-terms');
            const data = await response.json();

            if (data.length > 0) {

                const detailedTerms = await Promise.all(data.map(async (termName) => {
                    const res = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/search-term/${termName}`);
                    return await res.json();
                }));
                setTerms(detailedTerms);
            } else {
                setTerms([]);
            }
        } catch (error) {
            toast.error('Error fetching glossary terms');
        }
    };

    const handleCategoryChange = async (category) => {
        setCategory(category);
        try {
            const response = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/get-by-category/${category}`);
            const data = await response.json();
            setTerms(data);
        } catch (error) {
            toast.error('Error fetching glossary by category');
        }
    };

    const handleSearch = async () => {
        if (searchTerm) {
            try {

                const response = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/search-term/${searchTerm}`);
                const data = await response.json();
                if (data) {
                    setTerms([data]);
                } else {
                    toast.info('No results found for this search term');
                }
            } catch (error) {
                toast.error('Error searching for the term');
            }
        } else {

            fetchTerms();
        }
    };

    const handleTermClick = (term) => {
        setSelectedTerm(term);
    };

    return (
        <div className="glossary-container">
            <h2>Financial Glossary</h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by term"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>

                <select onChange={(e) => handleCategoryChange(e.target.value)} value={category}>
                    <option value="">Select Category</option>
                    <option value="Taxes">Taxes</option>
                    <option value="Investment">Investment</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Loans">Loans</option>
                    <option value="Credit">Credit</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Personal Finance">Personal Finance</option>
                    <option value="Economics">Economics</option>
                </select>
            </div>

            <div className="terms-list">
                {terms.length > 0 ? (
                    terms.map((term, index) => (
                        <div key={index} onClick={() => handleTermClick(term)}>
                            <h3>{term.term}</h3>
                            <p>{term.definition}</p>
                        </div>
                    ))
                ) : (
                    <p>No terms available for the selected category or search term</p>
                )}
            </div>

            {selectedTerm && (
                <div className="term-detail">
                    <h3>{selectedTerm.term}</h3>
                    <p>{selectedTerm.definition}</p>
                    <p><strong>Category: </strong>{selectedTerm.category}</p>
                </div>
            )}
        </div>
    );
}

export default FinancialGlossary;
