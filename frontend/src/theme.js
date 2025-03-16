// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Customize your primary color
        },
        secondary: {
            main: '#dc004e', // Customize your secondary color
        },
    },
    typography: {
        // Customize typography if needed
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        // Customize component styles if needed
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
    },
});

export default theme;
