import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';

function ChatPage() {
    const [message, setMessage] = useState('Hi there! I am your Financial Assistant - Erase & Enter Here');
    const [messages, setMessages] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyID, setHistoryID] = useState(null);
    const [previousHistory, setPreviousHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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
                const botResponse = {
                    sender: 'bot',
                    text: data.assistantReply || 'No response from bot',
                };
                const updatedMessages = [...newMessages, botResponse];
                setMessages(updatedMessages);
                localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
            } else {
                toast.error(data.message || 'Error getting response from bot');
            }
        } catch (error) {
            toast.error('Error communicating with the server');
        }
    };



    const filteredHistory = previousHistory.filter(item =>
        item.messages.some(msg => msg.role !== 'system') // Ensure there's at least one message with a role other than 'system'
    );

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
                <div className="history-panel-header">Search History</div>
                <div className="history-search">
                    <input
                        type="text"
                        className="history-search-bar"
                        placeholder="Search history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="history-panel-body">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((item, index) => {

                            const firstMessage = item.messages[1]?.content;

                            return (
                                <div
                                    key={index}
                                    className="history-item"
                                    onClick={() => {

                                        const allMessages = item.messages.map(msg => ({
                                            sender: msg.role === 'user' ? 'user' : 'bot',
                                            text: msg.content,
                                        }));

                                        setMessages(allMessages);
                                        setShowHistory(false);
                                    }}
                                >
                                    <p>{firstMessage}</p>
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
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <p>{msg.text}</p>
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
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;
