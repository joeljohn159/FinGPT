const Session = require('../models/History.js');
const { getFinancialAdvice } = require('../middleware/financialAPI.js');

// Start a new session
const startSession = async (req, res) => {
    const { userId } = req.user;

    try {
        const historyID = new Date().toISOString();


        const newSession = new Session({
            userId,
            historyID,
            messages: []
        });

        await newSession.save();

        res.status(201).json({ message: 'Session started', historyID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start a new session' });
    }
};


const addMessage = async (req, res) => {
    const { historyID, message } = req.body;
    const { userId } = req.user;

    if (!message || !historyID || !userId) {
        return res.status(400).json({ error: 'Missing required fields! Please restart the session' });
    }

    try {
        let session = await Session.findOne({ historyID, userId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }


        session.messages.push({ role: 'user', content: message });


        const assistantReply = await getFinancialAdvice(session.messages);
        session.messages.push({ role: 'assistant', content: assistantReply });

        await session.save();

        res.status(200).json({ assistantReply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update the session with new message' });
    }
};


const getAllUserHistory = async (req, res) => {
    const { userId } = req.user;

    try {
        const sessions = await Session.find({ userId });

        if (sessions.length === 0) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve user sessions' });
    }
};

module.exports = {
    startSession,
    addMessage,
    getAllUserHistory
};
