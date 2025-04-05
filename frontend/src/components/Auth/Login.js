// src/components/Auth/Login.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';

const Login = () => {
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Get redirect path and email from location state
    const redirectPath = location.state?.redirectAfterAuth || '/services';
    const prefilledEmail = location.state?.email || '';

    useEffect(() => {
        if (prefilledEmail) {
            setEmail(prefilledEmail);
        }
    }, [prefilledEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await loginUser(email, password);
        if (result.success) {
            navigate(redirectPath);
        } else {
            setError(result.message);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        type="password"
                        required
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Login
                    </Button>
                </form>
                <Typography variant="body2" align="center" mt={2}>
                    Don't have an account? <Link to="/register">Register</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;
