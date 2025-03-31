// src/components/Queues/CreateQueue.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
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
    const [createdQueue, setCreatedQueue] = useState(null);
    const [showTokenDialog, setShowTokenDialog] = useState(false);

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

        // Validate name length
        if (name.length < 1 || name.length > 100) {
            setError('Queue name must be between 1 and 100 characters');
            return;
        }

        if (!service_id && !organization_id) {
            // Queue will be tied directly to the user
        } else if (service_id && organization_id) {
            setError('Please select either a Service or an Organization, not both.');
            return;
        }

        try {
            const payload = {
                name,
                queue_type,
                max_capacity: max_capacity ? parseInt(max_capacity) : null,
                status,
            };

            // Only include service_id or organization_id if they are set
            if (service_id) {
                payload.service_id = parseInt(service_id);
            }
            if (organization_id) {
                payload.organization_id = parseInt(organization_id);
            }

            const response = await axios.post('/queues/', payload, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
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
            setError(err.response?.data.detail || 'Failed to create queue');
        }
    };

    const handleCloseTokenDialog = () => {
        setShowTokenDialog(false);
        navigate('/queues');
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
                        inputProps={{
                            maxLength: 100,
                        }}
                        helperText={`${name.length}/100 characters`}
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
                        inputProps={{
                            min: 1,
                            max: 1000,
                        }}
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
                            onChange={(e) => {
                                setServiceId(e.target.value);
                                if (e.target.value) {
                                    setOrganizationId('');
                                }
                            }}
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
                            onChange={(e) => {
                                setOrganizationId(e.target.value);
                                if (e.target.value) {
                                    setServiceId('');
                                }
                            }}
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

            <Dialog
                open={showTokenDialog}
                onClose={handleCloseTokenDialog}
                aria-labelledby="token-dialog-title"
                aria-describedby="token-dialog-description"
            >
                <DialogTitle id="token-dialog-title">Queue Access Information</DialogTitle>
                <DialogContent>
                    <DialogContentText id="token-dialog-description">
                        Your queue has been created successfully. Here is the access information:
                    </DialogContentText>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Access Token:</strong> {createdQueue?.access_token}
                        </Typography>
                        {createdQueue?.qr_code_url && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>QR Code:</strong>
                                </Typography>
                                <QRCode value={createdQueue.qr_code_url} size={200} />
                            </Box>
                        )}
                    </Box>
                    <Alert severity="warning">
                        Please save this information! You won't be able to see the access token again.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTokenDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CreateQueue;
