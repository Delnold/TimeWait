// src/components/Queues/QueuesList.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { List, ListItem, ListItemText, Paper, Chip, Stack, Button, Typography, Box, Alert, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import JoinQueue from './JoinQueue';

const QueuesList = () => {
    const { authToken, user } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [error, setError] = useState('');
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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
                setError(err.response?.data.detail || 'Failed to fetch queues');
            }
        };

        fetchQueues();
    }, [authToken]);

    // Determine permissions based on role
    const canManage = ['admin', 'business_owner'].includes(user?.role);

    const handleDelete = async (queueId, event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this queue?')) return;

        try {
            await axios.delete(`/queues/${queueId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setQueues(queues.filter(queue => queue.id !== queueId));
        } catch (err) {
            console.error('Error deleting queue:', err);
            setError(err.response?.data.detail || 'Failed to delete queue');
        }
    };

    const handleTokenSubmit = async () => {
        try {
            const response = await axios.get(`/queues/by-token/${accessToken}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response.data) {
                // Join the queue directly after finding it
                await axios.post(
                    `/queues/${response.data.id}/join?token=${accessToken}`,
                    {},
                    {
                        headers: { 
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );
                // Navigate to the queue page
                navigate(`/queues/${response.data.id}`);
                setTokenDialogOpen(false);
                setAccessToken('');
                setError('');
            }
        } catch (err) {
            setError('Invalid access token');
        }
    };

    // Filter out TOKEN_BASED queues unless user is admin or owner
    const visibleQueues = queues.filter(queue => 
        queue.queue_type !== 'TOKEN_BASED' || 
        (canManage || queue.user_id === user?.id)
    );

    return (
        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Queues</Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => setTokenDialogOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        Join with Token
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        component={Link} 
                        to="/queues/create"
                    >
                        Create Queue
                    </Button>
                </Box>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <List>
                {visibleQueues.map(queue => (
                    <ListItem 
                        key={queue.id} 
                        divider
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            textDecoration: 'none', 
                            color: 'inherit'
                        }}
                    >
                        <Box component={Link} to={`/queues/${queue.id}`} sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                            <ListItemText
                                primary={queue.name}
                                secondary={`Type: ${queue.queue_type} | Status: ${queue.status}`}
                            />
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            {queue.queue_type !== 'TOKEN_BASED' && (
                                <JoinQueue queueId={queue.id} />
                            )}
                            <Chip 
                                label={queue.status} 
                                color={
                                    queue.status === 'OPEN' ? 'success' :
                                    queue.status === 'PAUSED' ? 'warning' :
                                    'error'
                                } 
                            />
                            {(canManage || queue.user_id === user?.id) && (
                                <>
                                    <IconButton 
                                        component={Link} 
                                        to={`/queues/update/${queue.id}`} 
                                        color="primary"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        onClick={(e) => handleDelete(queue.id, e)} 
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </>
                            )}
                        </Stack>
                    </ListItem>
                ))}
                {visibleQueues.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No queues found." />
                    </ListItem>
                )}
            </List>

            <Dialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)}>
                <DialogTitle>Enter Access Token</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Access Token"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTokenDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleTokenSubmit} variant="contained" color="primary">
                        Join Queue
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default QueuesList;
