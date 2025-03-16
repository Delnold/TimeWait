// src/components/Organizations/CreateOrganization.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';

const CreateOrganization = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!name.trim()) {
            setError('Organization name is required.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                '/organizations/',
                {
                    name: name.trim(),
                    description: description.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setSuccess('Organization created successfully!');
            // Optionally, redirect to the organization's detail page
            navigate(`/organizations/${response.data.id}`);
        } catch (err) {
            console.error('Error creating organization:', err);
            setError(
                err.response?.data?.detail ||
                    'Failed to create organization. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} mb={3}>
                <Typography variant="h4" gutterBottom>
                    Create Organization
                </Typography>
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Organization Name"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        margin="normal"
                        multiline
                        rows={4}
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Create'
                        )}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default CreateOrganization;
