import React,
{
    useState
}

    from 'react';

import {
    Link,
    useNavigate
}

    from 'react-router-dom';
import '../styles/navbar.css';

function Navbar({
    darkMode

}) {
    const [isMenuOpen,
        setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

        ;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('chatHistory');
        navigate('/login');
        setIsMenuOpen(false);
    }

        ;

    return (<nav className="navbar" > <div className="settings-menu" > <button onClick={
        toggleMenu
    }

        className="settings-icon" > <svg xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"

            stroke={
                darkMode ? "#ffffff" : "#000000"
            }

            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"

        > <circle cx="12" cy="12" r="3" ></circle> <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" ></path> </svg> </button> {
            isMenuOpen && (<div className="dropdown-menu" > <Link to="/chat" className="dropdown-item" onClick={
                () => setIsMenuOpen(false)
            }

            > Chat </Link> <Link to="/financial-glossary" className="dropdown-item" onClick={
                () => setIsMenuOpen(false)
            }

            > Financial Glossary </Link> <Link to="/feedback" className="dropdown-item" onClick={
                () => setIsMenuOpen(false)
            }

            > User Feedback </Link> <button className="dropdown-item logout-button" onClick={
                handleLogout
            }

            > Logout </button> </div>)
        }

    </div> </nav>);
}

export default Navbar;