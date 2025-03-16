// src/components/Organizations/OrganizationsList.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { List, ListItem, ListItemText, Paper, Button, Typography, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const OrganizationsList = () => {
    const { authToken, user } = useContext(AuthContext);
    const [organizations, setOrganizations] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await axios.get('/organizations/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setOrganizations(response.data);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setError(err.response?.data.detail || 'Failed to fetch organizations');
            }
        };

        fetchOrganizations();
    }, [authToken]);

    // Determine if the user can manage organizations
    const canManage = ['ADMIN', 'BUSINESS_OWNER'].includes(user?.role);

    return (
        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Organizations</Typography>
                {canManage && (
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/organizations/create"
                    >
                        Create Organization
                    </Button>
                )}
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {organizations.map(org => (
                    <ListItem
                        key={org.id}
                        divider
                        component={Link}
                        to={`/organizations/${org.id}`}
                        button
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <ListItemText
                            primary={org.name}
                            secondary={org.description}
                        />
                    </ListItem>
                ))}
                {organizations.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No organizations found." />
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export default OrganizationsList;
