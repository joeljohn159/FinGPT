const Feedback = require('../models/Feedback.js');

const submitFeedback = async (req, res) => {
    const { feedbackContent, rating } = req.body;
    const { userId } = req.user; // Assuming the user is authenticated and userId is provided via JWT or session

    if (!userId || !feedbackContent || !rating) {
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    try {
        // Check if feedback already exists for the userId
        const existingFeedback = await Feedback.findOne({ userId });

        if (existingFeedback) {
            // If feedback exists, update it
            existingFeedback.feedbackContent = feedbackContent;
            existingFeedback.rating = rating;
            await existingFeedback.save();

            return res.status(200).json({ message: 'Feedback updated successfully' });
        } else {
            // If feedback does not exist, create a new one
            const newFeedback = new Feedback({
                userId,
                feedbackContent,
                rating,
            });

            await newFeedback.save();

            return res.status(201).json({ message: 'Feedback submitted successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};



const getUserFeedback = async (req, res) => {
    const { userId } = req.user;

    try {

        const feedbacks = await Feedback.find({ userId });

        if (feedbacks.length === 0) {
            return res.status(404).json({ error: 'No feedback found for this user' });
        }

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve user feedback' });
    }
};

module.exports = { submitFeedback, getUserFeedback };
