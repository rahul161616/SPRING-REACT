// context/AuthContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';

// Get API URL from environment variables or use default fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8080/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for token on initial load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            console.log("Token in localStorage:", token ? "Token exists" : "No token found");

            if (token) {
                try {
                    console.log("Attempting to validate token...");
                    // Validate the token with your API
                    const response = await fetch(`${AUTH_URL}/validate`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log("Validation response status:", response.status);

                    if (response.ok) {
                        const userData = await response.json();
                        console.log("Token validation successful, user data:", userData);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        // Token is invalid or expired
                        console.log("Token validation failed with status:", response.status);
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error validating token:', error);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            setUser(data.user || { username: credentials.username });
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();

            // If the backend returns a token on registration
            if (data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user || { username: userData.username });
                setIsAuthenticated(true);
            }

            return data;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        isLoading,
        login,
        register,
        logout
    }), [isAuthenticated, user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};