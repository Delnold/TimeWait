// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Named import for version 4.x
import axios from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => (authToken ? jwtDecode(authToken) : null));

    useEffect(() => {
        if (authToken) {
            try {
                const decodedUser = jwtDecode(authToken);
                setUser(decodedUser);
                localStorage.setItem('authToken', authToken);
            } catch (error) {
                console.error('Invalid token:', error);
                setAuthToken(null);
            }
        } else {
            setUser(null);
            localStorage.removeItem('authToken');
        }
    }, [authToken]);

    const loginUser = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', new URLSearchParams({
                username: email,
                password: password,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            setAuthToken(response.data.access_token);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: error.response?.data.detail || 'Login failed' };
        }
    };

    const registerUser = async (name, email, password, phone_number) => {
        try {
            await axios.post('/auth/register', {
                name,
                email,
                password,
                phone_number,
            });

            // Auto-login after registration
            const loginResponse = await loginUser(email, password);
            if (loginResponse.success) {
                return { success: true };
            } else {
                return { success: false, message: 'Registration successful, but login failed.' };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: error.response?.data.detail || 'Registration failed' };
        }
    };

    const logoutUser = () => {
        setAuthToken(null);
    };

    const contextData = {
        user, // Contains user information and role
        authToken,
        loginUser,
        registerUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
