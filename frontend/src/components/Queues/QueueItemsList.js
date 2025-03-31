// src/components/QueueItems/QueueItemsList.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { List, ListItem, ListItemText, Paper, Chip, Button, Typography, Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const QueueItemsList = () => {
    const { authToken } = useContext(AuthContext);
    const [queueItems, setQueueItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQueueItems = async () => {
            try {
                const response = await axios.get('/queue_items/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setQueueItems(response.data);
            } catch (err) {
                console.error('Error fetching queue items:', err);
                setError(err.response?.data.detail || 'Failed to fetch queue items');
            }
        };

        fetchQueueItems();
    }, [authToken]);

    const formatWaitTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    };

    return (
        <Paper elevation={3} sx={{ maxHeight: 400, overflow: 'auto', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Queue Items</Typography>
                <Button variant="contained" color="primary" component={Link} to="/queue-items/create">
                    Add Queue Item
                </Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {queueItems.map(item => (
                    <ListItem key={item.id} divider>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <span>{`Token ${item.token_number} - ${item.user ? item.user.name : 'Anonymous'}`}</span>
                                    {item.status === 'WAITING' && item.estimated_wait_time !== null && (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatWaitTime(item.estimated_wait_time)}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            }
                            secondary={`Status: ${item.status} | Joined At: ${new Date(item.joined_at).toLocaleString()}`}
                        />
                        <Chip label={item.status} color={
                            item.status === 'WAITING' ? 'default' :
                            item.status === 'BEING_SERVE' ? 'info' :
                            item.status === 'COMPLETED' ? 'success' :
                            'error'
                        } />
                    </ListItem>
                ))}
                {queueItems.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No queue items found." />
                    </ListItem>
                )}
            </List>
        </Paper>
    );
};

export default QueueItemsList;
