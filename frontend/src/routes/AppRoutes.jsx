// routes/AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import { AuthContext } from '../context/AuthContext';

function AppRoutes() {
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    // Show a loading indicator while checking authentication
    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route
                path="/"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route
                path="/profile"
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
        </Routes>
    );
}

export default AppRoutes;