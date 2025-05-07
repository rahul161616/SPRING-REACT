// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddEventButton from '../components/AddEventButton';
import EventList from '../components/EventList';
import '../styles/Sidebar.css';

function HomePage() {
    // Change default sidebar state to false (closed)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if screen is mobile size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Add listener for window resize
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // This effect is no longer needed since sidebar starts closed
    // but keeping it for consistency with other device checks
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="home-page">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} />

                <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <div className="welcome-section">
                        <h1>Welcome to EventApp</h1>
                        <p>Manage your events and tasks efficiently with our intuitive platform.</p>
                    </div>

                    <div className="content-section">
                        <EventList />
                    </div>
                </div>
            </div>

            <AddEventButton />

            <style jsx>{`
                .home-page {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background-color: #f5f7fa;
                }
                
                .app-container {
                    display: flex;
                    flex: 1;
                    padding-top: 60px; /* Space for navbar */
                }
                
                .main-content {
                    flex: 1;
                    padding: 2rem;
                    transition: margin-left 0.3s ease;
                    width: 100%;
                }
                
                .main-content.sidebar-open {
                    margin-left: 250px; /* Width of the sidebar */
                }
                
                .main-content.sidebar-closed {
                    margin-left: 0;
                }
                
                .welcome-section {
                    background: linear-gradient(135deg, var(--mainColor) 0%, var(--secondaryColor) 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 2.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .welcome-section h1 {
                    font-size: 2.2rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }
                
                .welcome-section p {
                    font-size: 1.1rem;
                    line-height: 1.5;
                    max-width: 600px;
                    opacity: 0.9;
                }
                
                .content-section {
                    background-color: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                }
                
                @media (max-width: 767px) {
                    .sidebar {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        height: calc(100vh - 60px);
                        z-index: 1000;
                    }
                    
                    .main-content {
                        padding: 1.5rem;
                    }
                    
                    .welcome-section {
                        padding: 1.8rem;
                    }
                    
                    .welcome-section h1 {
                        font-size: 1.8rem;
                    }
                    
                    .content-section {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default HomePage;