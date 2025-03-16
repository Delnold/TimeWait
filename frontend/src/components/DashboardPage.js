// src/components/DashboardPage.js

import React, { useState, useEffect, useContext } from 'react';
import {
    Container, Grid, Typography, Box, Card, CardContent, Alert, List, ListItem, ListItemText, Paper
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../utils/axios';

const DashboardPage = () => {
  const { authToken } = useContext(AuthContext);
  const [orgCount, setOrgCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [statsError, setStatsError] = useState('');

  // NEW: states for top queues/orgs
  const [topQueues, setTopQueues] = useState([]);
  const [topOrgs, setTopOrgs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Basic stats
        const orgRes = await axios.get('/organizations', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrgCount(orgRes.data.length);

        const queueRes = await axios.get('/queues', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setQueueCount(queueRes.data.length);

        const svcRes = await axios.get('/services/all', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setServiceCount(svcRes.data.length);

        // 2) Aggregated stats
        const statsRes = await axios.get('/stats', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setTopQueues(statsRes.data.top_queues);
        setTopOrgs(statsRes.data.top_organizations);
      } catch (err) {
        setStatsError(err.response?.data?.detail || 'Failed to fetch stats');
      }
    };

    fetchData();
  }, [authToken]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {statsError && <Alert severity="error">{statsError}</Alert>}

      {/* Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Organizations Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Organizations</Typography>
              <Typography variant="h3">{orgCount}</Typography>
              <Typography color="text.secondary">
                Total organizations in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Queues Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Queues</Typography>
              <Typography variant="h3">{queueCount}</Typography>
              <Typography color="text.secondary">
                Total queues in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Services Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Services</Typography>
              <Typography variant="h3">{serviceCount}</Typography>
              <Typography color="text.secondary">
                Total services in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Example: Show top queues */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Top Queues by People Joined
          </Typography>
          <Paper sx={{ p: 2 }}>
            {topQueues.length === 0 ? (
              <Typography>No queues found.</Typography>
            ) : (
              <List>
                {topQueues.map((q) => (
                  <ListItem key={q.queue_id}>
                    <ListItemText
                      primary={`${q.queue_name} (ID: ${q.queue_id})`}
                      secondary={`People Joined: ${q.count}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Show top organizations */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Top Organizations by People in Queues
          </Typography>
          <Paper sx={{ p: 2 }}>
            {topOrgs.length === 0 ? (
              <Typography>No organizations found.</Typography>
            ) : (
              <List>
                {topOrgs.map((o) => (
                  <ListItem key={o.org_id}>
                    <ListItemText
                      primary={`${o.org_name} (ID: ${o.org_id})`}
                      secondary={`Total People in Queues: ${o.count}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
