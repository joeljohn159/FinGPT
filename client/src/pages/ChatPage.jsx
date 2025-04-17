import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';

function ChatPage() {
    const [message, setMessage] = useState('Hi there! I am your Financial Assistant');
    const [messages, setMessages] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyID, setHistoryID] = useState(null);
    const [previousHistory, setPreviousHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            startSession(token);
            fetchPreviousHistory(token);
        }
    }, [navigate]);

    const fetchPreviousHistory = async (token) => {
        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setPreviousHistory(data || []);
            } else {
                toast.error(data.message || 'Failed to fetch previous history');
            }
        } catch (error) {
            toast.error('Error fetching previous history');
        }
    };

    const startSession = async (token) => {
        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial/start-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setHistoryID(data.historyID);
                toast.success('Session started successfully');
            } else {
                toast.error(data.message || 'Failed to start session');
                navigate('/login');
            }
        } catch (error) {
            toast.error('Error starting session');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !historyID) {
            return;
        }

        const newMessages = [...messages, { sender: 'user', text: message }];
        setMessages(newMessages);
        localStorage.setItem('chatHistory', JSON.stringify(newMessages));
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial/add-message', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    historyID,
                    message,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                let botText = data.assistantReply || 'No response from bot';
                botText = formatBotResponse(botText);

                const botResponse = {
                    sender: 'bot',
                    text: botText,
                };
                const updatedMessages = [...newMessages, botResponse];
                setMessages(updatedMessages);
                localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
            } else {
                toast.error(data.message || 'Error getting response from bot');
            }
        } catch (error) {
            toast.error('Error communicating with the server');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to format bot response: remove numbers, bold headers, double spacing
    const formatBotResponse = (text) => {
        // Step 1: Clean up markdown and normalize text
        let formattedText = text
            .replace(/[#-*]+/g, '') // Remove markdown symbols
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        // Step 2: Split into sentences and headers
        const lines = formattedText.split('. ');
        let result = [];

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            // Detect headers (e.g., "1. Explain the Basics", "Tax Deductions")
            if (/^\d+\.\s|[A-Z][a-zA-Z\s]+:/.test(line)) {
                // Remove numbers (e.g., "1. " or "2. ") from headers
                let headerText = line.replace(/^\d+\.\s*/, '');
                result.push(`**${headerText}**`);
            } else {
                // Regular sentences
                result.push(line + (index < lines.length - 1 && line !== '' ? '.' : ''));
            }
        });

        // Step 3: Join with double newlines for spacing
        return result.join('\n\n');
    };

    const filteredHistory = previousHistory.filter((item) =>
        item.messages.some((msg) => msg.role !== 'system')
    );

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="chat-container">
            {/* Show History Button */}
            <button
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#1a344c',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                className="show-history-btn"
                onClick={() => setShowHistory(!showHistory)}
            >
                {showHistory ? 'Close History' : 'Show History'}
            </button>

            <div className={`history-panel ${showHistory ? 'active' : ''}`}>

                <div className="history-panel-body">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((item, index) => {
                            const firstMessage = item.messages[1]?.content || '';
                            return (
                                <div
                                    key={index}
                                    className="history-item"
                                    onClick={() => {
                                        const allMessages = item.messages.map((msg) => ({
                                            sender: msg.role === 'user' ? 'user' : 'bot',
                                            text: msg.content,
                                        }));
                                        setMessages(allMessages);
                                        setShowHistory(false);
                                    }}
                                >
                                    <p>{truncateText(firstMessage, 30)}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p>No history found</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {/* Loader */}
                {isLoading && (
                    <div className="loader-container">
                        <div className="spinner"></div>
                    </div>
                )}

                <div className="messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <p
                                style={{ whiteSpace: 'pre-line' }}
                                dangerouslySetInnerHTML={{
                                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Input Box for sending messages */}
                <form onSubmit={handleSendMessage} className="message-input-form">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button type="submit" disabled={isLoading}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;