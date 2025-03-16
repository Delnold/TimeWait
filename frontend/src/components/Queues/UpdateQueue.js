// src/components/Queues/UpdateQueue.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';

const UpdateQueue = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { queueId } = useParams();

    const [name, setName] = useState('');
    const [queue_type, setQueueType] = useState('');
    const [max_capacity, setMaxCapacity] = useState('');
    const [status, setStatus] = useState('');

    const [error, setError] = useState('');
    const [serviceId, setServiceId] = useState(null);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await axios.get(`/queues/${queueId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                const data = response.data;
                setName(data.name);
                setQueueType(data.queue_type);
                setMaxCapacity(data.max_capacity || '');
                setStatus(data.status);
                setServiceId(data.service_id);
            } catch (err) {
                console.error('Error fetching queue:', err);
                setError(err.response?.data.detail || 'Failed to fetch queue');
            }
        };

        fetchQueue();
    }, [queueId, authToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.put(`/queues/${queueId}`, {
                name,
                queue_type,
                max_capacity: max_capacity ? parseInt(max_capacity) : null,
                status,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            navigate(`/services/${serviceId}/queues`);
        } catch (err) {
            console.error('Error updating queue:', err);
            setError(err.response?.data.detail || 'Failed to update queue');
        }
    };

    if (error && !serviceId) {
        // If there's an error fetching the queue and no serviceId is set, don't render the form
        return (
            <Container maxWidth="sm">
                <Box mt={5}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box mt={5}>
                <Typography variant="h4" gutterBottom>
                    Update Queue
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
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Update
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default UpdateQueue;
