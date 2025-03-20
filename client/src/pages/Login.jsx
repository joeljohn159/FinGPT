import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch('https://fingpt-oz2a.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('token', data);  // Save JWT token
                console.log(data)


                toast.success('Login successful!');


                navigate('/chat');
            } else {

                toast.error(data.message || 'Login failed!');
            }
        } catch (error) {

            toast.error('An error occurred, please try again later!');
        }
    };

    const handleNavigateToSignUp = () => {
        navigate('/signup'); // Navigate to the signup page
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="auth-form">
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

                <button type="submit">Login</button>

                <p>
                    Don't have an account?{' '}
                    <button type="button" onClick={handleNavigateToSignUp} className="link-button">
                        Sign Up here
                    </button>
                </p>
            </form>
        </div>
    );
}

export default Login;
