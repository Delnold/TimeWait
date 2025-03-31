// frontend/src/components/Queues/JoinQueue.js
import React, { useState, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const JoinQueue = ({ queueId }) => {
  const { authToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `/queues/${queueId}/join`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      navigate(`/queues/${queueId}`);
    } catch (err) {
      console.error('Error joining queue:', err);
      setError(err.response?.data?.detail || 'Failed to join queue');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? 'Joining...' : 'Join Queue'}
      </Button>
    </Box>
  );
};

export default JoinQueue;
