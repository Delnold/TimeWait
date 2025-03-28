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

  // Listen for real-time WebSocket events
  const updates = useQueueUpdates();

  // Fetch the queue details from the backend API
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

  // Process incoming WebSocket events
  useEffect(() => {
    if (!queue) return;
    updates.forEach(event => {
      // Handle removal events
      if (
        event.event_type === 'QUEUE_ITEM_REMOVED' &&
        parseInt(event.payload.queue_id, 10) === parseInt(queueId, 10)
      ) {
        setQueue(prev => ({
          ...prev,
          queue_items: prev.queue_items.filter(item => item.id !== event.payload.item_id)
        }));
      }
      // Handle join events—avoid duplicates by checking both the item id and join_hash
      else if (
        event.event_type === 'QUEUE_ITEM_JOINED' &&
        parseInt(event.payload.queue_id, 10) === parseInt(queueId, 10)
      ) {
        setQueue(prev => {
          if (!prev) return prev;
          const exists = prev.queue_items.some(
            item =>
              item.id === event.payload.queue_item_id ||
              (item.join_hash && item.join_hash === event.payload.join_hash)
          );
          if (exists) return prev;
          const newItem = {
            id: event.payload.queue_item_id,
            token_number: event.payload.token_number,
            joined_at: event.payload.joined_at,
            join_hash: event.payload.join_hash, // use join_hash for duplicate checking
            user: {
              id: event.payload.user_id,
              name: event.payload.user_name || 'Anonymous'
            }
          };
          return { ...prev, queue_items: [...prev.queue_items, newItem] };
        });
      }
      // Handle generic queue updates
      else if (
        event.event_type === 'QUEUE_UPDATED' &&
        event.payload.queue_id === queueId
      ) {
        setQueue(prev => ({ ...prev, ...event.payload.updates }));
      }
    });
  }, [updates, queue, queueId]);

  // Determine if the current user has permission to manage (remove items)
  const canManageQueue = () => {
    if (!queue || !user) return false;
    if (queue.user_id && queue.user_id === user.sub) return true;
    if (user.role === 'ADMIN' || user.role === 'BUSINESS_OWNER') return true;
    return false;
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      await axios.delete(`/queues/${queueId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // The state update will be handled by the WebSocket event
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
                secondary={`User: ${item.user && item.user.name ? item.user.name : 'Anonymous'}`}
              />
              {canManageQueue() && (
                <Button variant="outlined" color="error" onClick={() => handleRemoveItem(item.id)}>
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
