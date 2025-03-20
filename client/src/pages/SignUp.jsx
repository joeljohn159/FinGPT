import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();


        if (!email || !password) {
            toast.error('Please fill in both fields');
            return;
        }

        try {
            const response = await axios.post('https://fingpt-oz2a.onrender.com/api/auth/signup', {
                email,
                password
            });

            toast.success('Sign up successful! You can now login.');
            navigate('/login');
        } catch (error) {

            if (error.response) {

                toast.error(error.response.data.message || 'An error occurred. Please try again.');
            } else if (error.request) {

                toast.error('No response from server. Please try again later.');
            } else {

                toast.error('An unexpected error occurred.');
            }
        }
    };

    const handleNavigateToLogin = () => {
        navigate('/login');  // Navigate programmatically to /login
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp} className="auth-form">
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit">Sign Up</button>

                <p>
                    Already have an account?{' '}
                    <button type="button" onClick={handleNavigateToLogin} className="link-button">
                        Login here
                    </button>
                </p>
            </form>
        </div>
    );
}

export default SignUp;
