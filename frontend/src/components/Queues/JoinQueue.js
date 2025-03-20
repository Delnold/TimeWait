// frontend/src/components/Queues/JoinQueue.js
import React, { useState, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Button, CircularProgress, Alert, Box } from '@mui/material';

const JoinQueue = ({ queueId, onJoined }) => {
  const { authToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`/queues/${queueId}/join`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (onJoined) onJoined(response.data);
      // The WebSocket event "QUEUE_ITEM_JOINED" will update the UI.
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join queue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" color="primary" onClick={handleJoin} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : "Join Queue"}
      </Button>
    </Box>
  );
};

export default JoinQueue;
