// src/components/Queues/CreateQueue.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';

const CreateQueue = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [queue_type, setQueueType] = useState('GENERAL');
    const [max_capacity, setMaxCapacity] = useState('');
    const [status, setStatus] = useState('OPEN');
    const [service_id, setServiceId] = useState('');
    const [organization_id, setOrganizationId] = useState('');
    const [services, setServices] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    const [error, setError] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get('/services/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setServices(response.data);
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };

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
            }
        };

        fetchServices();
        fetchOrganizations();
    }, [authToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!service_id && !organization_id) {
            // Queue will be tied directly to the user
        } else if (service_id && organization_id) {
            setError('Please select either a Service or an Organization, not both.');
            return;
        }

        try {
            await axios.post('/queues/', {
                name,
                queue_type,
                max_capacity: max_capacity ? parseInt(max_capacity) : null,
                status,
                service_id: service_id ? parseInt(service_id) : null,
                organization_id: organization_id ? parseInt(organization_id) : null,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            navigate('/queues');
        } catch (err) {
            console.error('Error creating queue:', err);
            setError(err.response?.data.detail || 'Failed to create queue');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5}>
                <Typography variant="h4" gutterBottom>
                    Create Queue
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="queue-type-label">Queue Type</InputLabel>
                        <Select
                            labelId="queue-type-label"
                            label="Queue Type"
                            value={queue_type}
                            onChange={(e) => setQueueType(e.target.value)}
                        >
                            <MenuItem value="GENERAL">General</MenuItem>
                            <MenuItem value="TOKEN_BASED">Token Based</MenuItem>
                            <MenuItem value="PRIORITY">Priority</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Max Capacity"
                        variant="outlined"
                        margin="normal"
                        type="number"
                        fullWidth
                        value={max_capacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                    />
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="PAUSED">Paused</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="service-label">Service</InputLabel>
                        <Select
                            labelId="service-label"
                            label="Service"
                            value={service_id}
                            onChange={(e) => setServiceId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {services.map(service => (
                                <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="organization-label">Organization</InputLabel>
                        <Select
                            labelId="organization-label"
                            label="Organization"
                            value={organization_id}
                            onChange={(e) => setOrganizationId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {organizations.map(org => (
                                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Create
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default CreateQueue;
