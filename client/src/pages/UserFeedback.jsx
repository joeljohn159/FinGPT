import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../styles/userFeedback.css';

function UserFeedback() {
    const [feedbackContent, setFeedbackContent] = useState('');
    const [rating, setRating] = useState(1);
    const token = localStorage.getItem('token');

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        if (!feedbackContent.trim()) {
            toast.error('Feedback cannot be empty');
            return;
        }

        if (!rating) {
            toast.error('Please provide a rating');
            return;
        }

        try {
            const response = await fetch('https://fingpt-oz2a.onrender.com/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedbackContent, rating }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Feedback submitted successfully');
                setFeedbackContent('');
                setRating(1);
            } else {
                toast.error(data.message || 'Error submitting feedback');
            }
        } catch (error) {
            toast.error('Error submitting feedback');
        }
    };

    return (
        <div className="feedback-container">
            <h2>User Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="Please provide your feedback"
                    className="feedback-textarea"
                />

                <div className="rating-container">
                    <label htmlFor="rating">Rating:</label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="rating-select"
                    >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2 - Fair</option>
                        <option value={3}>3 - Good</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={5}>5 - Excellent</option>
                    </select>
                </div>

                <button type="submit" className="submit-btn">Submit Feedback</button>
            </form>
        </div>
    );
}

export default UserFeedback;
