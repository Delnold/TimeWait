// src/components/Queues/CreateQueue.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import QRCode from 'qrcode.react';

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
    const [loading, setLoading] = useState(false);
    const [showTokenDialog, setShowTokenDialog] = useState(false);
    const [createdQueue, setCreatedQueue] = useState(null);

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
        setLoading(true);

        if (!service_id && !organization_id) {
            // Queue will be tied directly to the user
        } else if (service_id && organization_id) {
            setError('Please select either a Service or an Organization, not both.');
            return;
        }

        try {
            const response = await axios.post('/queues/', {
                name,
                queue_type: queue_type,
                max_capacity: max_capacity ? parseInt(max_capacity) : null,
                status,
                service_id: service_id ? parseInt(service_id) : null,
                organization_id: organization_id ? parseInt(organization_id) : null,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (queue_type === 'TOKEN_BASED') {
                setCreatedQueue(response.data);
                setShowTokenDialog(true);
            } else {
                navigate('/queues');
            }
        } catch (err) {
            console.error('Error creating queue:', err);
            setError(err.response?.data?.detail || 'Failed to create queue');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseTokenDialog = () => {
        setShowTokenDialog(false);
        navigate('/queues');
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create New Queue
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Queue Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Queue Type</InputLabel>
                        <Select
                            value={queue_type}
                            onChange={(e) => setQueueType(e.target.value)}
                            label="Queue Type"
                        >
                            <MenuItem value="GENERAL">General</MenuItem>
                            <MenuItem value="TOKEN_BASED">Token Based</MenuItem>
                            <MenuItem value="PRIORITY">Priority</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Max Capacity (optional)"
                        type="number"
                        value={max_capacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        margin="normal"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Queue'}
                    </Button>
                </form>

                <Dialog open={showTokenDialog} onClose={handleCloseTokenDialog}>
                    <DialogTitle>Queue Created Successfully</DialogTitle>
                    <DialogContent>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Please save this access token. It will not be shown again!
                        </Alert>
                        <Typography variant="body1" gutterBottom>
                            <strong>Access Token:</strong> {createdQueue?.access_token}
                        </Typography>
                        {createdQueue?.qr_code_url && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="body1" gutterBottom>
                                    <strong>QR Code:</strong>
                                </Typography>
                                <QRCode value={createdQueue.qr_code_url} size={200} />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseTokenDialog} variant="contained" color="primary">
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default CreateQueue;
