// src/components/Queues/QueuesList.js

import React, { useState, useEffect, useContext } from 'react'; // Import useState, useEffect, useContext
import { AuthContext } from '../../contexts/AuthContext'; // Import AuthContext
import axios from '../../utils/axios'; // Import axios
import { List, ListItem, ListItemText, Paper, Chip, Stack, Button, Typography, Box, Alert, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Edit, Delete } from '@mui/icons-material';
import JoinQueue from './JoinQueue';

const QueuesList = () => {
    const { authToken, user } = useContext(AuthContext);
    const [queues, setQueues] = useState([]);
    const [error, setError] = useState('');

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
    const canManage = ['ADMIN', 'BUSINESS_OWNER'].includes(user?.role);

    const handleDelete = async (queueId) => {
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
                    <ListItem key={queue.id} divider
                      component={Link}
                      to={`/queues/${queue.id}`}
                      button
                      sx={{ textDecoration: 'none', color: 'inherit' }}>
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
                            {canManage && (
                                <>
                                    <IconButton component={Link} to={`/queues/update/${queue.id}`} color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(queue.id)} color="error">
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
