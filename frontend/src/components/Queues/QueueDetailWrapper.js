import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { AuthContext } from '../../contexts/AuthContext';
import QueueDetail from './QueueDetail';
import { Container, Typography, Alert } from '@mui/material';

const QueueDetailWrapper = () => {
  const { queueId } = useParams();
  const { authToken } = useContext(AuthContext);
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`/queues/${queueId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setQueue(response.data);
      } catch (err) {
        setError(err.response?.data.detail || 'Failed to fetch queue');
      }
    };
    fetchQueue();
  }, [queueId, authToken]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!queue) {
    return <Typography>Loading queue details...</Typography>;
  }
  return (
    <Container>
      <QueueDetail queue={queue} />
    </Container>
  );
};

export default QueueDetailWrapper;
