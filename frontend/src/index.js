// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

ReactDOM.render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* Resets CSS to a consistent baseline */}
                <App />
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
