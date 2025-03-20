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

function QueueAdmin() {
  const { queueId } = useParams();
  const { authToken } = useContext(AuthContext);
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updates = useQueueUpdates();

  useEffect(() => {
    async function fetchQueue() {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`/queues/${queueId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setQueue(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch queue');
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, [queueId, authToken]);

  // Process real-time events
  useEffect(() => {
    updates.forEach((evt) => {
      if (evt.event_type === 'QUEUE_ITEM_REMOVED') {
        if (parseInt(evt.payload.queue_id, 10) === parseInt(queueId, 10)) {
          setQueue((prev) => {
            if (!prev) return prev;
            const filtered = prev.queue_items.filter(
              (item) => item.id !== evt.payload.item_id
            );
            return { ...prev, queue_items: filtered };
          });
        }
      }
    });
  }, [updates, queueId]);

  async function removeItem(itemId) {
    const confirm = window.confirm('Remove this item from the queue?');
    if (!confirm) return;

    try {
      await axios.delete(`/queues/${queueId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // The actual removal from state happens when the WebSocket event arrives
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove item');
    }
  }

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!queue) {
    return <Typography>Loading queue data...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {queue.name}
      </Typography>
      <List>
        {queue.queue_items.length === 0 && (
          <ListItem>
            <ListItemText primary="No users in this queue." />
          </ListItem>
        )}
        {queue.queue_items.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={`Token: ${item.token_number}`}
              secondary={`User: ${item.user ? item.user.name : 'Anonymous'} | Status: ${item.status}`}
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default QueueAdmin;
