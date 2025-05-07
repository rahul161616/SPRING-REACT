// components/Sidebar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Sidebar.css';

function Sidebar({ isOpen }) {
    const { logout } = useContext(AuthContext);

    // Force bare minimum of styling without relying on CSS files
    const baseStyles = {
        sidebar: {
            backgroundColor: '#f0f0f0', // Fallback color
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: '60px',
            width: '250px',
            maxWidth: '85%',
            padding: '20px',
            zIndex: 1000,
            overflowY: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            background: 'var(--secondaryColor, #f0f0f0)'
        },
        title: {
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--mainColor, #333)'
        },
        nav: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        link: {
            color: 'var(--mainColor, #333)',
            textDecoration: 'none',
            padding: '10px 0',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            display: 'block'
        },
        button: {
            color: 'white',
            backgroundColor: 'var(--mainColor, #333)',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '20px',
            cursor: 'pointer',
            width: '100%'
        }
    };

    // Don't render content when closed to avoid any CSS issues
    if (!isOpen) {
        return <div style={{ ...baseStyles.sidebar, visibility: 'hidden' }}></div>;
    }

    return (
        <>
            {/* Mobile overlay */}
            <div
                style={{
                    display: isOpen ? 'block' : 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Sidebar with inline styles */}
            <div style={baseStyles.sidebar}>
                <h2 style={baseStyles.title}>Menu</h2>
                <div style={baseStyles.nav}>
                    <Link to="/profile" style={baseStyles.link}>
                        Profile Settings
                    </Link>
                    <button
                        onClick={logout}
                        style={baseStyles.button}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;