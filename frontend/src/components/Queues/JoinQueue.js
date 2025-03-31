// frontend/src/components/Queues/JoinQueue.js
import React, { useState, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box, Button, Typography, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const JoinQueue = ({ queueId }) => {
  const { authToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedItem, setJoinedItem] = useState(null);

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`/queues/${queueId}/join`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setJoinedItem(response.data);
    } catch (err) {
      console.error('Error joining queue:', err);
      setError(err.response?.data.detail || 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {joinedItem ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            You have joined the queue!
          </Typography>
          <Typography>
            <strong>Token Number:</strong> {joinedItem.token_number}
          </Typography>
          <Typography>
            <strong>Confirmation Code:</strong> {joinedItem.join_hash}
          </Typography>
          <Typography>
            <strong>Joined At:</strong> {new Date(joinedItem.joined_at).toLocaleString()}
          </Typography>
          {joinedItem.estimated_wait_time !== null && (
            <Typography sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <strong>Estimated Wait Time:</strong> {formatWaitTime(joinedItem.estimated_wait_time)}
            </Typography>
          )}
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Queue'}
        </Button>
      )}
    </Box>
  );
};

export default JoinQueue;
