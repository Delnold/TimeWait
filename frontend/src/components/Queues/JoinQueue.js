import React, { useState, useContext } from 'react';
import { Button, Alert, Typography, Box } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

const JoinQueue = ({ queueId }) => {
  const { authToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [joinedItem, setJoinedItem] = useState(null);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      // Call the join endpoint
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
