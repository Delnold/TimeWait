// frontend/src/components/QueueDashboard.js
import React from 'react';
import useQueueUpdates from '../hooks/useQueueUpdates';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const QueueDashboard = () => {
  const updates = useQueueUpdates();

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc' }}>
      <Typography variant="h5" gutterBottom>
        Real-Time Queue Updates
      </Typography>
      <List>
        {updates.map((update, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={update.event_type}
              secondary={JSON.stringify(update.payload)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QueueDashboard;
