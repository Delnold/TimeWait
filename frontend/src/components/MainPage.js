// src/components/MainPage.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Typography, Box, TextField, Alert, Button } from '@mui/material';
import OrganizationsList from './Organizations/OrganizationsList';
import QueuesList from './Queues/QueuesList';
import axios from '../utils/axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MainPage = () => {
    const { authToken, user } = useContext(AuthContext);
    const [organizations, setOrganizations] = useState([]);
    const [queues, setQueues] = useState([]);
    const [orgSearch, setOrgSearch] = useState('');
    const [queueSearch, setQueueSearch] = useState('');
    const [filteredOrgs, setFilteredOrgs] = useState([]);
    const [filteredQueues, setFilteredQueues] = useState([]);
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
                setError('Failed to fetch organizations');
            }
        };

        const fetchQueues = async () => {
            try {
                const response = await axios.get('/queues/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setQueues(response.data);
            } catch (err) {
                console.error('Error fetching queues:', err);
                setError('Failed to fetch queues');
            }
        };

        fetchOrganizations();
        fetchQueues();
    }, [authToken]);

    // Handle search for organizations
    useEffect(() => {
        const results = organizations.filter(org =>
            org.name.toLowerCase().includes(orgSearch.toLowerCase())
        );
        setFilteredOrgs(results);
    }, [orgSearch, organizations]);

    // Handle search for queues
    useEffect(() => {
        const results = queues.filter(queue =>
            queue.name.toLowerCase().includes(queueSearch.toLowerCase())
        );
        setFilteredQueues(results);
    }, [queueSearch, queues]);

    // Determine if the user can create organizations
    const canCreateOrganization = ['ADMIN', 'BUSINESS_OWNER'].includes(user?.role);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {/* Organizations Section */}
                <Grid item xs={12} md={6}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" gutterBottom>
                            Organizations
                        </Typography>
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Search Organizations"
                            variant="outlined"
                            fullWidth
                            value={orgSearch}
                            onChange={(e) => setOrgSearch(e.target.value)}
                        />
                    </Box>
                    <OrganizationsList organizations={filteredOrgs} />
                </Grid>

                {/* Queues Section */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Queues
                    </Typography>
                    <Box mb={2}>
                        <TextField
                            label="Search Queues"
                            variant="outlined"
                            fullWidth
                            value={queueSearch}
                            onChange={(e) => setQueueSearch(e.target.value)}
                        />
                    </Box>
                    <QueuesList queues={filteredQueues} />
                </Grid>
            </Grid>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Container>
    );
};

export default MainPage;
