import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './../styles/financialGlossary.css';

// Shuffle array utility function
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

function FinancialGlossary() {
    const [terms, setTerms] = useState([]);
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState(null);

    useEffect(() => {
        fetchRandomTerms();
    }, []);

    const fetchRandomTerms = async () => {
        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial-glossary/get-all-terms');
            // const response = await fetch('http://localhost:8080/api/financial-glossary/get-all-terms');
            const data = await response.json();

            if (data.length > 0) {
                // Shuffle and select up to 30 random terms
                const randomTerms = shuffleArray(data).slice(0, 30);
                const detailedTerms = await Promise.all(
                    randomTerms.map(async (termName) => {
                        const res = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/search-term/${termName}`);
                        // const res = await fetch(`http://localhost:8080/api/financial-glossary/search-term/${termName}`);
                        return await res.json();
                    })
                );
                setTerms(detailedTerms.filter(term => term)); // Filter out any null/undefined results
            } else {
                setTerms([]);
                toast.info('No glossary terms available');
            }
        } catch (error) {
            toast.error('Error fetching glossary terms');
            console.error('Fetch error:', error);
        }
    };

    const handleCategoryChange = async (category) => {
        setCategory(category);
        setSearchTerm(''); // Clear search term when changing category
        if (category) {
            try {
                const response = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/get-by-category/${category}`);
                // const response = await fetch(`http://localhost:8080/api/financial-glossary/get-by-category/${category}`);
                const data = await response.json();
                setTerms(data);
            } catch (error) {
                toast.error('Error fetching glossary by category');
                console.error('Category error:', error);
            }
        } else {
            fetchRandomTerms();
        }
    };

    const handleSearch = async () => {
        if (searchTerm) {
            try {
                const response = await fetch(`https://fingpt-oz2a.onrender.com/api/financial-glossary/search-term/${searchTerm}`);
                // const response = await fetch(`http://localhost:8080/api/financial-glossary/search-term/${searchTerm}`);
                const data = await response.json();
                if (data) {
                    setTerms([data]);
                } else {
                    setTerms([]);
                    toast.info('No results found for this search term');
                }
            } catch (error) {
                toast.error('Error searching for the term');
                console.error('Search error:', error);
            }
        } else {
            fetchRandomTerms();
        }
    };

    const handleTermClick = (term) => {
        setSelectedTerm(term);
    };

    const closeModal = () => {
        setSelectedTerm(null);
    };

    // Extract YouTube embed URL
    const getYouTubeEmbedUrl = (resourceLinks) => {
        if (!resourceLinks) return null;
        const youtubeLink = resourceLinks.find(link => link.type === 'YouTube');
        if (youtubeLink) {
            const videoId = youtubeLink.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        return null;
    };

    return (
        <div className="glossary-container">
            <h2>Financial Glossary</h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by term (e.g., Mutual Fund)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>

                <select onChange={(e) => handleCategoryChange(e.target.value)} value={category}>
                    <option value="">All Categories</option>
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
                        <div key={index} className="term-card" onClick={() => handleTermClick(term)}>
                            <h3>{term.term}</h3>
                            <p>{term.definition.length > 60 ? `${term.definition.slice(0, 60)}...` : term.definition}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-terms">No terms available for the selected category or search term</p>
                )}
            </div>

            {selectedTerm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <h3>{selectedTerm.term}</h3>
                        <p><strong>Definition:</strong> {selectedTerm.definition}</p>
                        {selectedTerm.category && (
                            <p><strong>Category:</strong> {selectedTerm.category}</p>
                        )}
                        {selectedTerm.example && (
                            <p><strong>Example:</strong> {selectedTerm.example}</p>
                        )}
                        {selectedTerm.synonyms?.length > 0 && (
                            <p><strong>Synonyms:</strong> {selectedTerm.synonyms.join(', ')}</p>
                        )}
                        {selectedTerm.resourceLinks?.length > 0 && (
                            <div className="resource-links">
                                <strong>Resources:</strong>
                                <ul>
                                    {selectedTerm.resourceLinks.map((link, idx) => (
                                        <li key={idx}>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                {link.title} ({link.type})
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {getYouTubeEmbedUrl(selectedTerm.resourceLinks) && (
                            <div className="youtube-embed">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src={getYouTubeEmbedUrl(selectedTerm.resourceLinks)}
                                    title={selectedTerm.term}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FinancialGlossary;