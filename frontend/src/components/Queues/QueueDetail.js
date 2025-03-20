// frontend/src/components/Queues/QueueDetail.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import useQueueUpdates from '../../hooks/useQueueUpdates';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

const QueueDetail = () => {
  const { queueId } = useParams();
  const { authToken, user } = useContext(AuthContext);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get real-time events from Kafka via WebSocket
  const updates = useQueueUpdates();

  // Fetch queue details from backend
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`/queues/${queueId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setQueue(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch queue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [queueId, authToken]);

  // Process WebSocket events to update queue state in real time.
  useEffect(() => {
    if (!queue) return;
    updates.forEach(event => {
      if (event.event_type === 'QUEUE_ITEM_REMOVED' &&
          parseInt(event.payload.queue_id, 10) === parseInt(queueId, 10)) {
        setQueue(prev => ({
          ...prev,
          queue_items: prev.queue_items.filter(item => item.id !== event.payload.item_id)
        }));
      } else if (event.event_type === 'QUEUE_ITEM_JOINED' &&
                 parseInt(event.payload.queue_id, 10) === parseInt(queueId, 10)) {
        // Append new item if not already in the list
        setQueue(prev => ({
          ...prev,
          queue_items: [...prev.queue_items, {
            id: event.payload.queue_item_id,
            token_number: event.payload.token_number,
            joined_at: event.payload.joined_at,
            // Minimal user info – adjust if you need more details
            user: { id: event.payload.user_id }
          }]
        }));
      } else if (event.event_type === 'QUEUE_UPDATED' &&
                 event.payload.queue_id === queueId) {
        setQueue(prev => ({ ...prev, ...event.payload.updates }));
      }
    });
  }, [updates, queue, queueId]);

  // Check permissions: if the queue is tied to a user, only the owner can manage;
  // if it's organization‑based, assume ADMIN or BUSINESS_OWNER can manage.
  const canManageQueue = () => {
    if (!queue || !user) return false;
    if (queue.user_id && queue.user_id === user.sub) return true;
    if (user.role === 'ADMIN' || user.role === 'BUSINESS_OWNER') return true;
    return false;
  };

  // Handler to remove a queue item.
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      await axios.delete(`/queues/${queueId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // The removal will be reflected via the WebSocket event.
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove queue item.');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!queue) return <Typography>No queue data available.</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{queue.name}</Typography>
      {queue.description && (
        <Typography variant="body1" gutterBottom>{queue.description}</Typography>
      )}
      <Typography variant="subtitle2" gutterBottom>
        Created by: {queue.user ? queue.user.name : 'Unknown'}
      </Typography>
      <Typography variant="h6" sx={{ mt: 3 }}>Queue Items</Typography>
      <List>
        {queue.queue_items.length === 0 ? (
          <ListItem>
            <ListItemText primary="No items in the queue." />
          </ListItem>
        ) : (
          queue.queue_items.map(item => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`Token: ${item.token_number}`}
                secondary={`User: ${item.user ? item.user.name : 'Anonymous'}`}
              />
              {canManageQueue() && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              )}
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default QueueDetail;
