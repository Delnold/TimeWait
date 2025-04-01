// src/theme.js

import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'light' ? '#1B4371' : '#2A5A94', // Adjust for dark mode
            light: mode === 'light' ? '#2A5A94' : '#3B6BA5',
            dark: mode === 'light' ? '#0F2D4F' : '#1B4371',
            contrastText: '#ffffff',
        },
        secondary: {
            main: mode === 'light' ? '#C41E3A' : '#DC3545', // Brighter red for dark mode
            light: mode === 'light' ? '#DC3545' : '#E84A56',
            dark: mode === 'light' ? '#AB1830' : '#C41E3A',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'light' ? '#F5F7FA' : '#121212',
            paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
        },
        text: {
            primary: mode === 'light' ? '#2C3E50' : '#FFFFFF',
            secondary: mode === 'light' ? '#5D6D7E' : '#B0B8C1',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.01562em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.00833em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            letterSpacing: '0em',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            letterSpacing: '0.00735em',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            letterSpacing: '0em',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.0075em',
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.00938em',
        },
        body1: {
            fontSize: '1rem',
            letterSpacing: '0.00938em',
            lineHeight: 1.6,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderRadius: 0,
                    backgroundImage: mode === 'light' 
                        ? 'linear-gradient(to right, #1B4371, #2A5A94)'
                        : 'linear-gradient(to right, #121212, #1E1E1E)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: 'none',
                },
                elevation1: {
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                },
                elevation2: {
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                },
                elevation3: {
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                },
            },
        },
    },
    shape: {
        borderRadius: 0,
    },
});

export default getTheme;
