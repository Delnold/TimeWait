// src/components/Queues/QueuesList.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { List, ListItem, ListItemText, Paper, Chip, Stack, Button, Typography, Box, Alert, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import JoinQueue from './JoinQueue';

const QueuesList = () => {
    const { authToken, user } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [error, setError] = useState('');
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

    // Determine if user can manage a specific queue
    const canManageQueue = (queue) => {
        if (!user) return false;
        // Global admin can manage any queue
        if (user.role.toLowerCase() === 'admin') return true;
        // Queue owner can manage their queue
        if (queue.user_id === user.sub) return true;
        // Business owner can manage organization queues
        if (user.role.toLowerCase() === 'business_owner') return true;
        return false;
    };

    const handleDelete = async (e, queueId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        
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

    const handleEdit = (e, queueId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        navigate(`/queues/update/${queueId}`);
    };

    const handleQueueClick = (queueId) => {
        navigate(`/queues/${queueId}`);
    };

    return (
        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Queues</Typography>
                <Button variant="contained" color="primary" component={Link} to="/queues/create">
                    Create Queue
                </Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {queues.map(queue => (
                    <ListItem 
                        key={queue.id} 
                        divider
                        onClick={() => handleQueueClick(queue.id)}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <ListItemText
                            primary={queue.name}
                            secondary={`Type: ${queue.queue_type} | Status: ${queue.status}`}
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <JoinQueue queueId={queue.id} />
                            <Chip label={queue.status} color={
                                queue.status === 'OPEN' ? 'success' :
                                queue.status === 'PAUSED' ? 'warning' :
                                'error'
                            } />
                            {canManageQueue(queue) && (
                                <>
                                    <IconButton 
                                        onClick={(e) => handleEdit(e, queue.id)} 
                                        color="primary"
                                        size="small"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        onClick={(e) => handleDelete(e, queue.id)} 
                                        color="error"
                                        size="small"
                                    >
                                        <Delete />
                                    </IconButton>
                                </>
                            )}
                        </Stack>
                    </ListItem>
                ))}
                {queues.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No queues found." />
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export default QueuesList;
