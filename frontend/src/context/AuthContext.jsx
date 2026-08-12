import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signingIn, setSigningIn] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    // Idle Timeout Logic (30 minutes)
    useEffect(() => {
        let timeout;

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            if (user) {
                timeout = setTimeout(() => {
                    logout();
                    alert('Session expired due to inactivity. Please log in again.');
                }, 30 * 60 * 1000); // 30 minutes
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        if (user) {
            events.forEach(event => window.addEventListener(event, resetTimer));
            resetTimer(); 
        }

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user, logout]);

    const login = async (email, password) => {
        try {
            setError(null);
            setSigningIn(true);
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);

            const userRes = await api.get('/auth/me');
            setUser(userRes.data.data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        } finally {
            setSigningIn(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const res = await api.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);

            const userRes = await api.get('/auth/me');
            setUser(userRes.data.data);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                signingIn,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
