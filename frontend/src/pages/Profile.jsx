// pages/ProfilePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/Auth.css';
import '../styles/Sidebar.css';

function Profile() {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        fullName: '',
        bio: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
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

    // Close sidebar by default on mobile
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch profile data when component mounts
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchProfileData();
        }
    }, [isAuthenticated, user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    username: data.username || user.username || '',
                    email: data.email || '',
                    fullName: data.fullName || '',
                    bio: data.bio || '',
                    phone: data.phone || ''
                });
            } else {
                // If profile endpoint fails, use data from auth context
                setProfileData({
                    username: user.username || '',
                    email: user.email || '',
                    fullName: user.fullName || '',
                    bio: user.bio || '',
                    phone: user.phone || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setMessage({
                text: 'Error loading profile data. Please try again later.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                setMessage({ text: errorData.message || 'Failed to update profile', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} />

                <div className={`main-content ${isSidebarOpen ? (isMobile ? 'sidebar-open' : '') : 'sidebar-closed'}`}>
                    <div className="profile-container">
                        <h2>Profile Settings</h2>

                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="profile-content">
                            {loading && !profileData.username ? (
                                <div className="loading-indicator">Loading profile information...</div>
                            ) : isEditing ? (
                                <form onSubmit={handleSubmit} className="profile-form">
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={profileData.username}
                                            onChange={handleInputChange}
                                            disabled
                                        />
                                        <small>Username cannot be changed</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={profileData.fullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="bio">Bio</label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleInputChange}
                                            rows="4"
                                        />
                                    </div>

                                    <div className="profile-actions">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="save-button"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-details">
                                    <div className="profile-field">
                                        <span className="field-label">Username:</span>
                                        <span className="field-value">{profileData.username}</span>
                                    </div>

                                    <div className="profile-field">
                                        <span className="field-label">Email:</span>
                                        <span className="field-value">{profileData.email || 'Not set'}</span>
                                    </div>

                                    <div className="profile-field">
                                        <span className="field-label">Full Name:</span>
                                        <span className="field-value">{profileData.fullName || 'Not set'}</span>
                                    </div>

                                    <div className="profile-field">
                                        <span className="field-label">Phone Number:</span>
                                        <span className="field-value">{profileData.phone || 'Not set'}</span>
                                    </div>

                                    {profileData.bio && (
                                        <div className="profile-field bio-field">
                                            <span className="field-label">Bio:</span>
                                            <p className="bio-content">{profileData.bio}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="edit-profile-button"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
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
                }
                
                .profile-container {
                    background-color: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                }
                
                .profile-container h2 {
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    color: var(--mainColor);
                    border-bottom: 2px solid var(--mainColor);
                    padding-bottom: 0.5rem;
                    display: inline-block;
                }
                
                .message {
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    border-radius: 6px;
                    font-weight: 500;
                }
                
                .message.success {
                    background-color: rgba(76, 175, 80, 0.1);
                    color: #4caf50;
                    border: 1px solid #c8e6c9;
                }
                
                .message.error {
                    background-color: rgba(244, 67, 54, 0.1);
                    color: #f44336;
                    border: 1px solid #ffcdd2;
                }
                
                .loading-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: #777;
                    font-size: 1.1rem;
                }
                
                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                
                .form-group label {
                    font-weight: 600;
                    margin-bottom: 0.4rem;
                    color: #555;
                }
                
                .form-group small {
                    font-size: 0.8rem;
                    color: #777;
                    margin-top: 0.3rem;
                }
                
                .form-group input, .form-group textarea {
                    padding: 0.8rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                
                .form-group input:focus, .form-group textarea:focus {
                    border-color: var(--mainColor);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
                }
                
                .form-group input:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                }
                
                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    justify-content: flex-end;
                }
                
                .cancel-button, .save-button, .edit-profile-button {
                    padding: 0.8rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                }
                
                .cancel-button {
                    background-color: #f0f0f0;
                    color: #333;
                }
                
                .cancel-button:hover {
                    background-color: #e0e0e0;
                }
                
                .save-button, .edit-profile-button {
                    background-color: var(--mainColor);
                    color: white;
                }
                
                .save-button:hover, .edit-profile-button:hover {
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }
                
                .save-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                .profile-details {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .profile-field {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.8rem 0;
                    border-bottom: 1px solid #eee;
                }
                
                .profile-field:last-of-type {
                    border-bottom: none;
                }
                
                .field-label {
                    font-weight: 600;
                    color: #555;
                    min-width: 120px;
                }
                
                .field-value {
                    color: #333;
                }
                
                .bio-field {
                    flex-direction: column;
                }
                
                .bio-content {
                    margin-top: 0.5rem;
                    line-height: 1.5;
                    white-space: pre-wrap;
                }
                
                .edit-profile-button {
                    align-self: flex-start;
                    margin-top: 1rem;
                }
                
                @media (max-width: 767px) {
                    .main-content {
                        padding: 1.5rem;
                    }
                    
                    .profile-container {
                        padding: 1.5rem;
                    }
                    
                    .profile-field {
                        flex-direction: column;
                        gap: 0.3rem;
                    }
                    
                    .field-label {
                        min-width: auto;
                    }
                }
            `}</style>
        </div>
    );
}

export default Profile;