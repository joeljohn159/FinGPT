import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import '../styles/chat.css'; // Use the updated chat.css below
import { FaPaperclip, FaFilePdf, FaHistory, FaFileExport, FaPlus, FaImage, FaTimes, FaPaperPlane } from 'react-icons/fa'; // Added FaPaperPlane
import graphLogo from '../assets/graph-logo.png';
import logo from '../assets/logo.png'; // Your main logo for welcome screen

// --- Import Google Generative AI ---
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// --- Get API Key ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_FALLBACK_API_KEY"; // Use environment variable

function ChatPage() {
    // --- Base State ---
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi there! I am your Financial Assistant' }
    ]);
    const [showHistory, setShowHistory] = useState(false);
    const [historyID, setHistoryID] = useState(null);
    const [previousHistory, setPreviousHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const navigate = useNavigate();

    // --- File Handling State ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState('');
    const [filePreviewUrl, setFilePreviewUrl] = useState('');
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null); // Ref for scrolling to bottom

    // --- Suggestions ---
    const suggestions = [
        "Current market trends?",
        "Stock market basics",
        "How to start investing?",
        "Explain financial ratios",
        "Latest market news",
        "Summarize the attached document.",
    ];

    // --- Effects ---
    useEffect(() => {
        // Cleanup function for file preview URL
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

     // Scroll to bottom when messages update
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchPreviousHistory(token);
            if (!historyID) {
                 // Only start a new backend session if we don't have one AND
                 // we are not loading an existing chat from local storage potentially
                 // This avoids overriding a potentially active session ID.
                 // Let's assume we always want a backend ID for GPT capabilities.
                 startSession(token);
            }
        }
        if (!GEMINI_API_KEY && selectedModel === 'gemini') {
             toast.warn('Gemini API Key is missing or invalid.');
        }
    }, [navigate]); // Removed historyID from dependencies to avoid loop on setHistoryID

     // --- Gemini API Client Setup ---
     let genAI;
     let geminiModel;
     try {
         if (GEMINI_API_KEY) {
             genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
             geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
         }
     } catch (error) {
         console.error("Error initializing GoogleGenerativeAI:", error);
         // Toast handled in send message if key missing/invalid
     }

     const generationConfig = { /* ... as before ... */ };
     const safetySettings = [ /* ... as before ... */ ];

    // --- Helper to convert File object to Base64 ---
    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve, reject) => { // Added reject
            const reader = new FileReader();
             reader.onloadend = () => {
                 if (reader.result) {
                    resolve(reader.result.split(',')[1]); // Get Base64 part
                 } else {
                    reject(new Error("Failed to read file."));
                 }
             };
             reader.onerror = (error) => reject(error); // Handle read error
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };


    // --- API & Core Functions ---

    const fetchPreviousHistory = async (token) => {
        setIsLoading(true); // Consider showing loading state specifically for history fetch
        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/financial/history', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                const validHistory = (data || [])
                    .filter(item => item.messages && item.messages.length > 1 && item.messages.slice(1).some(msg => ['user', 'assistant'].includes(msg.role)))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first
                setPreviousHistory(validHistory);
            } else if (response.status !== 404) {
                toast.error(data.message || 'Failed to fetch history');
            } else {
                setPreviousHistory([]);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error('Network error fetching history');
        } finally {
            setIsLoading(false);
        }
    };

    const startSession = async (token, isExplicitNewChat = false) => {
        // No need to set isLoading here unless it's a user-blocking action
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
                setHistoryID(data.historyID); // Set the new session ID
                if (isExplicitNewChat) {
                    // Clear messages for a new chat
                    setMessages([{ sender: 'bot', text: 'Hello! How can I assist you with your finances today?' }]);
                    removeSelectedFile();
                    setMessage('');
                    localStorage.removeItem(`chatHistory_${historyID}`); // Clear old storage if any
                    toast.success('New chat started');
                }
                // Don't load from local storage here, let loadHistorySession handle it if needed
            } else {
                console.error("Failed to start backend session:", data.message);
                // Don't toast error unless explicit action fails
                // toast.error(data.message || 'Failed to start backend session');
            }
        } catch (error) {
            console.error('Error starting backend session:', error);
            // Don't toast error on initial load potentially
            // toast.error('Network error starting backend session');
        }
        // No finally isLoading here
    };

    const startNewChat = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            // Reset UI immediately
            setMessages([{ sender: 'bot', text: 'Hello! How can I assist you with your finances today?' }]);
            removeSelectedFile();
            setMessage('');
            setShowHistory(false); // Close history panel if open
            setHistoryID(null); // Clear current history ID association
            // Start a new backend session AND clear state
            startSession(token, true);
            // Fetch history again to reflect potential changes (though a new session won't appear immediately)
            fetchPreviousHistory(token);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Simple size check (e.g., 10MB limit) - adjust as needed
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
            removeSelectedFile(); // Clear input
            return;
        }


        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl('');
        }
        const fileType = file.type;
        if (fileType.startsWith('image/') || fileType === 'application/pdf') {
            setSelectedFile(file);
            setSelectedFileType(fileType.startsWith('image/') ? 'image' : 'pdf');
            if (fileType.startsWith('image/')) {
                try {
                   setFilePreviewUrl(URL.createObjectURL(file));
                } catch (error) {
                    console.error("Error creating object URL:", error);
                    toast.error("Could not create image preview.");
                    removeSelectedFile();
                    return;
                }
            }
        } else {
            toast.error('Please upload a valid PDF or Image file.');
            removeSelectedFile();
        }
         // Clear the file input value so the same file can be selected again if removed
         if (fileInputRef.current) {
             fileInputRef.current.value = "";
         }
    };

     const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

     const removeSelectedFile = () => {
        setSelectedFile(null);
        setSelectedFileType('');
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl('');
        }
        // No need to clear fileInputRef.current.value here, handleFileChange does it
    };

    // --- *** UPDATED SEND MESSAGE LOGIC *** ---
    const submitMessageWithText = async (textToSend) => {
        const trimmedText = textToSend.trim();

        if (!trimmedText && !selectedFile) {
            // Removed toast warning, button should be disabled
            return;
        }

        setIsLoading(true); // Show loader immediately

        // --- Construct User Message for UI ---
        let userMessageTextForDisplay = trimmedText;
        let messagePayload = { sender: 'user', text: userMessageTextForDisplay, timestamp: new Date() };

        // Store file info with the message for potential display later, but don't include preview in text
        if (selectedFile) {
            const fileIndicator = `[Attached ${selectedFileType}: ${selectedFile.name}]`;
            // Append indicator only if there's also text, otherwise let the file indicator UI handle it
            userMessageTextForDisplay = trimmedText ? `${trimmedText}\n${fileIndicator}` : fileIndicator;

            messagePayload = {
                ...messagePayload,
                text: userMessageTextForDisplay, // Text might just be the indicator if no message typed
                fileData: { // Store basic file info with the message
                    name: selectedFile.name,
                    type: selectedFileType,
                    // Don't store previewUrl here, rely on the temporary state `filePreviewUrl` if needed for immediate display
                }
            };
        }

        const currentFile = selectedFile; // Capture the file state before clearing
        const currentFileType = selectedFileType; // Capture file type
        const currentText = trimmedText; // Capture text

        const newMessages = [...messages, messagePayload];
        setMessages(newMessages);
        setMessage(''); // Clear input field state
        removeSelectedFile(); // Clear file state *immediately* after capturing it

        // --- <<< BRANCH BASED ON SELECTED MODEL >>> ---
        try { // Wrap the whole sending process in try/catch/finally
            if (selectedModel === 'gemini') {
                // --- Handle with Google Gemini API (Client-Side) ---
                if (!GEMINI_API_KEY || !genAI || !geminiModel) {
                    throw new Error("Gemini API not configured. Check API Key.");
                }

                const promptParts = [];
                let promptText = currentText;

                 // Construct prompt text based on file/text presence
                 if (currentFile && !promptText) {
                     promptText = `Analyze the attached ${currentFileType}: ${currentFile.name}`;
                 } else if (currentFile && promptText) {
                      promptText = `Based on the attached ${currentFileType} (${currentFile.name}) and my question:\n\n${currentText}`;
                 } // Else: promptText remains currentText if no file

                if (promptText) {
                    promptParts.push({ text: promptText });
                }

                if (currentFile) {
                    // This might throw if file reading fails
                    const filePart = await fileToGenerativePart(currentFile);
                    promptParts.push(filePart);
                }

                if (promptParts.length === 0) {
                     // This case should ideally not happen due to initial checks
                    throw new Error("Cannot send an empty message.");
                }

                // --- Call Gemini API ---
                const result = await geminiModel.generateContent({
                    contents: [{ role: "user", parts: promptParts }],
                    generationConfig,
                    safetySettings,
                });

                 if (!result.response) {
                     // Check for blocked content response structure
                     const blockReason = result.response?.promptFeedback?.blockReason;
                     if (blockReason) {
                         throw new Error(`Content blocked by Gemini safety filters: ${blockReason}`);
                     }
                     throw new Error("Gemini API response was empty or invalid.");
                 }
                 const response = result.response;
                 const botText = response.text(); // Method to get text

                 const formattedBotText = formatBotResponse(botText || "No text response received.");
                 const botResponse = { sender: 'bot', text: formattedBotText, timestamp: new Date() };
                 setMessages(prev => [...prev, botResponse]); // Use functional update

            } else {
                // --- Handle with Existing GPT Backend ---
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Authentication token missing.");

                let endpoint = '';
                let requestBody;
                const headers = { 'Authorization': `Bearer ${token}` };

                if (currentFile) {
                    // Use the file processing backend endpoint
                    endpoint = 'https://fingpt-oz2a.onrender.com/api/process-file/analyze';
                    requestBody = new FormData();
                    requestBody.append('file', currentFile);
                    if (historyID) requestBody.append('historyID', historyID); // Send if available
                    requestBody.append('message', currentText); // Send associated text
                    requestBody.append('model', selectedModel); // e.g., 'gpt-4o'
                } else {
                     if (!historyID) {
                         // If no file and no historyID, we might need to start a session first
                         // Or decide if text-only messages *require* an active session
                         console.warn("Attempting to send text message without an active backend historyID.");
                         // Option 1: Attempt to start session silently (might have side effects)
                         // Option 2: Throw error (safer?)
                         throw new Error("No active backend session for text message.");
                     }
                    // Use the standard message backend endpoint
                    endpoint = 'https://fingpt-oz2a.onrender.com/api/financial/add-message';
                    headers['Content-Type'] = 'application/json';
                    requestBody = JSON.stringify({
                        historyID, // Crucial for this endpoint
                        message: currentText,
                        model: selectedModel,
                    });
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: headers,
                    body: requestBody,
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `Backend request failed (${response.status})`);
                }

                let botText = data.assistantReply || 'No response received from backend.';
                botText = formatBotResponse(botText);
                const botResponse = { sender: 'bot', text: botText, timestamp: new Date() };
                setMessages(prev => [...prev, botResponse]); // Use functional update
            }

            // Save successful chat to local storage (optional, based on historyID if available)
            // Decide if you want to save Gemini chats locally too.
            // For now, only save if historyID exists (GPT interaction)
            if (historyID) {
                // Get the latest messages state after bot response
                setMessages(currentMsgs => {
                    localStorage.setItem(`chatHistory_${historyID}`, JSON.stringify(currentMsgs));
                    return currentMsgs;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(`Failed to send message: ${error.message}`);
            // Revert UI - remove the optimistically added user message
            setMessages(messages);
            // Optionally, restore the input field and selected file if desired, though clearing is often preferred UX on error.
            // setMessage(currentText);
            // setSelectedFile(currentFile); // This requires more state management if file object needs recreating
        } finally {
            setIsLoading(false); // Stop loader regardless of success/failure
        }
    };

    // --- handleSendMessage (Event handler) ---
    const handleSendMessage = (e) => {
        if (e) e.preventDefault(); // Prevent form submission page reload
        submitMessageWithText(message);
    };

    // --- handleSuggestionClick (Uses the helper) ---
    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion); // Set input field visually
        submitMessageWithText(suggestion); // Send it
    };


    // --- Utility Functions --- (formatBotResponse, handleExportToPDF, truncateText remain similar)
    const formatBotResponse = (text) => {
       // Basic formatting - enhance as needed (e.g., handle code blocks, lists better)
        let formattedText = text
            // Headers (more specific markdown style)
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italics
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
             // Strikethrough (Example)
             .replace(/~~(.*?)~~/g, '<del>$1</del>')
             // Unordered lists
             .replace(/^\s*[-*+] (.+)/gm, '<li>$1</li>')
             .replace(/<\/li>\n?<li>/g, '</li><li>') // Clean up list item spacing
             .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>') // Wrap consecutive LIs in UL
             .replace(/<\/ul>\n?<ul>/g, '') // Merge adjacent ULs
            // Ordered lists
             .replace(/^\s*\d+\. (.+)/gm, '<oli>$1</oli>') // Use temporary tag
             .replace(/<\/oli>\n?<oli>/g, '</oli><oli>') // Clean up list item spacing
             .replace(/(<oli>.*<\/oli>)/gs, '<ol>$1</ol>') // Wrap consecutive OLIs in OL
             .replace(/<\/ol>\n?<ol>/g, '') // Merge adjacent OLs
             .replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>') // Replace temp tag
            // Basic code block (simple heuristic) - Needs improvement for multi-line and language detection
             .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
             // Inline code
             .replace(/`(.*?)`/g, '<code>$1</code>')
            // Newlines to <br> (do this last)
            .replace(/\n/g, '<br />')
             // Clean up potential double breaks around block elements
             .replace(/<br \/>(<(h[1-6]|ul|ol|pre|blockquote))/gi, '$1')
             .replace(/(<\/(h[1-6]|ul|ol|pre|blockquote)>)<br \/>/gi, '$1')
             // Remove leading/trailing breaks possibly introduced
             .trim();

          // Ensure block elements are not inside paragraphs implicitly added by browser
          // This is complex to get perfect without a full markdown parser library
         return formattedText;
    };

    const handleExportToPDF = () => {
        if (messages.length <= 1) return; // Need more than just the initial bot message

        const doc = new jsPDF();
        let yPos = 15;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15; // Increased margin
        const maxLineWidth = doc.internal.pageSize.width - margin * 2;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Financial Chat History", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150); // Light gray for timestamp
        doc.text(`Exported: ${new Date().toLocaleString()}`, margin, yPos);
        yPos += 8;
        doc.setDrawColor(200); // Light gray line
        doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
        yPos += 8;


        messages.slice(1).forEach((msg) => { // Skip initial bot message
            const isUser = msg.sender === 'user';
            const prefix = isUser ? 'You: ' : 'Bot: ';
             // Basic HTML removal for PDF - improve if complex HTML is common
             const textContent = msg.text.replace(/<[^>]*>/g, '');
             const fullText = prefix + textContent;

             const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
             const textLines = doc.splitTextToSize(fullText, maxLineWidth - (isUser ? 5 : 0)); // Indent user slightly less maybe?
             const requiredHeight = (textLines.length * 5) + (timestamp ? 4 : 0) + 5; // Calculate needed space + padding

            if (yPos + requiredHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                 // Draw header line on new page
                 doc.setDrawColor(200);
                 doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
                 yPos += 8;
            }

             // Set color based on sender
             doc.setFont("helvetica", "bold");
             doc.setTextColor(isUser ? 40 : 0); // Darker blue for user, black for bot
             doc.text(isUser ? 'You' : 'Bot', margin + (isUser ? maxLineWidth - 10 : 0), yPos, { align: isUser ? 'right' : 'left' }); // Sender Label

             if (timestamp) {
                 doc.setFont("helvetica", "italic");
                 doc.setFontSize(8);
                 doc.setTextColor(150);
                 doc.text(timestamp, margin + (isUser ? 0 : maxLineWidth - 10), yPos, { align: isUser ? 'left' : 'right' }); // Timestamp
             }
             yPos += 5; // Space after header line

             doc.setFont("helvetica", "normal");
             doc.setFontSize(10);
             doc.setTextColor(50); // Standard text color
             doc.text(textLines.map(line => line.replace(prefix, '')), margin + (isUser ? 5 : 0), yPos); // Actual message content
             yPos += textLines.length * 5 + 5; // Space after message block
        });

        doc.save(`FinGPT-Chat-${historyID || 'Session'}-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Chat history exported to PDF.');
    };

     const filteredHistory = previousHistory; // Already filtered and sorted in fetch

     const truncateText = (text, maxLength) => {
        if (!text) return "Empty Chat";
        // Remove potential HTML before truncating for preview
        const plainText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length <= maxLength ? plainText : plainText.substring(0, maxLength) + '...';
    };

    const loadHistorySession = (item) => {
         // Format messages from backend structure
         const formattedMessages = item.messages
             .filter(msg => ['user', 'assistant'].includes(msg.role)) // Ensure only valid roles
             .map(msg => ({
                 sender: msg.role === 'user' ? 'user' : 'bot',
                  // Format bot response, keep user content as is (unless it needs formatting too)
                 text: msg.role === 'assistant' ? formatBotResponse(msg.content) : msg.content,
                 timestamp: item.createdAt // Use session creation as a fallback timestamp maybe? Or add timestamps in backend
             }));

          // Ensure the chat always starts with a bot message for consistency
         if (formattedMessages.length === 0 || formattedMessages[0].sender !== 'bot') {
             formattedMessages.unshift({ sender: 'bot', text: 'Hi there! Resuming your session.', timestamp: item.createdAt });
         }

         setMessages(formattedMessages);
         setHistoryID(item.historyID); // Set the active history ID
         setShowHistory(false); // Close history panel
         removeSelectedFile(); // Clear any lingering file selection
         setMessage(''); // Clear input field

         // Save the loaded history to local storage under its ID
         localStorage.setItem(`chatHistory_${item.historyID}`, JSON.stringify(formattedMessages));

         // Optional: Switch model back to GPT if loading backend history?
         // setSelectedModel('gpt-4o');
         toast.info(`Loaded chat session from ${new Date(item.createdAt).toLocaleDateString()}`);
    };

    // --- JSX Structure ---
    return (
        <div className={`chat-page-container ${showHistory ? 'history-panel-open' : ''}`}>
            {/* History Panel (Sidebar) */}
            <div className={`history-panel ${showHistory ? 'active' : ''}`}>
                 <div className="history-panel-header">
                     <span>Chat History</span>
                     {/* UI Change: Added dedicated New Chat button here */}
                     <button onClick={startNewChat} className="new-chat-button-sidebar" title="Start New Chat">
                         <FaPlus /> New Chat
                     </button>
                 </div>
                 <div className="history-panel-body">
                     {filteredHistory.length > 0 ? (
                         filteredHistory.map((item) => {
                             // Find first user message content for preview
                             const firstUserMessage = item.messages.find(msg => msg.role === 'user');
                             const previewText = firstUserMessage?.content || item.messages[1]?.content || `Chat ${item.historyID.substring(0, 6)}`;
                             return (
                                 <div key={item.historyID} className="history-item" onClick={() => loadHistorySession(item)}>
                                     <p title={previewText}>{truncateText(previewText, 35)}</p> {/* Increased length slightly */}
                                     <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                                 </div>
                             );
                         })
                     ) : (
                         <p className="no-history">No previous chat sessions found.</p>
                     )}
                 </div>
            </div>

             {/* Action Buttons (Floating on right) */}
             {/* UI Change: Simplified structure, using CSS for layout */}
            <div className="floating-action-buttons">
                 {/* Note: New Chat is primarily in sidebar now, could remove this one */}
                 {/* <button className="action-button" onClick={startNewChat} title="Start New Chat" disabled={isLoading}>
                    <FaPlus /> <span className="button-text">New</span>
                </button> */}
                <button className="action-button" onClick={() => setShowHistory(!showHistory)} title={showHistory ? 'Hide History' : 'Show History'} disabled={isLoading}>
                    <FaHistory /> <span className="button-text">History</span>
                </button>
                <button className="action-button" onClick={handleExportToPDF} disabled={messages.length <= 1 || isLoading} title="Export Chat to PDF">
                    <FaFileExport /> <span className="button-text">Export</span>
                </button>
            </div>


            {/* Main Chat Area */}
            <div className="chat-area-container">
                <div className="chat-area">
                    {/* Messages Display */}
                    <div className="messages">
                        {/* Welcome Screen / Suggestions - Shown only if messages array has only the initial bot message */}
                        {messages.length === 1 && messages[0].sender === 'bot' && !isLoading && (
                            <div className="welcome-container">
                                <img src={logo} alt="FinGPT Logo" className="welcome-logo" />
                                <h2>How can I help you today?</h2>
                                {selectedModel === 'gemini' && !GEMINI_API_KEY && (
                                    <p className="api-key-warning">Warning: Gemini API Key missing!</p>
                                )}
                                <div className="chat-suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} className="suggestion-chip" onClick={() => handleSuggestionClick(suggestion)}>
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actual Messages */}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                                {msg.sender === 'bot' && (
                                    <img src={graphLogo} alt="Bot Avatar" className="bot-avatar" />
                                )}
                                {/* UI Change: Using dangerouslySetInnerHTML carefully with formatted HTML */}
                                <div className="message-content" dangerouslySetInnerHTML={{ __html: msg.text }} />
                                {/* Add ref to the last message */}
                                {index === messages.length - 1 && <div ref={messagesEndRef} />}
                            </div>
                        ))}
                        {/* Loader */}
                        {isLoading && (
                             <div className="message bot-message loader-message">
                                 <img src={graphLogo} alt="Bot Avatar" className="bot-avatar" />
                                 <div className="message-content">
                                     <div className="typing-indicator">
                                         <span></span><span></span><span></span>
                                     </div>
                                 </div>
                             </div>
                        )}
                    </div>

                    {/* Input Form Area */}
                    {/* UI Change: Restructured input form */}
                    <div className="message-input-section">
                         {/* UI Change: File indicator moved below input */}
                         {selectedFile && (
                             <div className="selected-file-indicator">
                                 {selectedFileType === 'image' && filePreviewUrl && (
                                     <img src={filePreviewUrl} alt="Preview" className="indicator-image-preview" />
                                 )}
                                 {selectedFileType === 'pdf' && (
                                     <FaFilePdf className="indicator-icon pdf-icon" />
                                 )}
                                  {selectedFileType === 'image' && !filePreviewUrl && ( // Fallback icon
                                     <FaImage className="indicator-icon image-icon" />
                                  )}
                                 <span className="file-name" title={selectedFile.name}>{truncateText(selectedFile.name, 30)}</span>
                                 <button type="button" onClick={removeSelectedFile} className="remove-file-btn" title="Remove file" disabled={isLoading}>
                                     <FaTimes />
                                 </button>
                             </div>
                         )}
                        <form onSubmit={handleSendMessage} className="message-input-form">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            <button type="button" onClick={triggerFileInput} className="attach-button" title="Attach PDF or Image" disabled={isLoading}>
                                <FaPaperclip />
                            </button>
                            <textarea // UI Change: Using textarea for potentially multi-line input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={`Ask ${selectedModel === 'gemini' ? 'Gemini' : 'GPT-4'} or attach file...`}
                                disabled={isLoading}
                                rows={1} // Start with one row
                                onKeyDown={(e) => {
                                     // Send on Enter, new line on Shift+Enter
                                     if (e.key === 'Enter' && !e.shiftKey && !isLoading && (message.trim() || selectedFile)) {
                                         e.preventDefault();
                                         handleSendMessage();
                                     }
                                }}
                                // Auto-resize textarea (optional, requires more JS or CSS)
                                style={{ maxHeight: '100px', resize: 'none', overflowY: 'auto' }} // Basic height limit
                            />
                            <select
                                value={selectedModel}
                                onChange={(e) => {
                                    setSelectedModel(e.target.value);
                                    if (e.target.value === 'gemini' && !GEMINI_API_KEY) {
                                        toast.warn('Gemini API Key is missing or invalid.');
                                    }
                                }}
                                className="model-selector"
                                disabled={isLoading}
                                title="Select AI Model"
                            >
                                <option value="gpt-4o">GPT-4</option>
                                <option value="gemini">Gemini</option>
                            </select>
                            <button
                                type="submit"
                                className="send-button"
                                title="Send Message"
                                disabled={isLoading || (!message.trim() && !selectedFile) || (selectedModel === 'gemini' && !GEMINI_API_KEY)}
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                         {/* Add footer/branding if desired */}
                         {/* <div className="chat-footer">FinGPT by YourTeam</div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;