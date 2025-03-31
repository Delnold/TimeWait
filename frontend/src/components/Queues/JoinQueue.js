// frontend/src/components/Queues/JoinQueue.js
import React, { useState, useContext } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Box, Button, Typography, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const JoinQueue = ({ queueId, queueType }) => {
  const { authToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedItem, setJoinedItem] = useState(null);
  const [token, setToken] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleJoin = async (tokenInput = null) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`/queues/${queueId}/join`, 
        tokenInput ? { token: tokenInput } : {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setJoinedItem(response.data);
      setDialogOpen(false);
    } catch (err) {
      console.error('Error joining queue:', err);
      setError(err.response?.data.detail || 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    handleJoin(token);
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  const handleOpenDialog = () => {
    if (queueType === 'TOKEN_BASED') {
      setDialogOpen(true);
    } else {
      handleJoin();
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
          {joinedItem.estimated_wait_time !== null && (
            <Typography sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <strong>Estimated Wait Time:</strong> {formatWaitTime(joinedItem.estimated_wait_time)}
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={loading}
          >
            {loading ? 'Joining...' : queueType === 'TOKEN_BASED' ? 'Join With Token' : 'Join Queue'}
          </Button>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Enter Access Token</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Access Token"
                type="text"
                fullWidth
                variant="outlined"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleTokenSubmit} variant="contained" color="primary">
                Join Queue
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default JoinQueue;
