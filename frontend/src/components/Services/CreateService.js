// src/components/Services/CreateService.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const CreateService = () => {
  const { authToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // Service fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact_email, setContactEmail] = useState('');
  const [contact_phone, setContactPhone] = useState('');

  // Error message
  const [error, setError] = useState('');

  // Organization dropdown state
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await axios.get('/organizations/', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setOrganizations(response.data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to fetch organizations');
      }
    };
    fetchOrgs();
  }, [authToken]);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure user picked an organization
    if (!selectedOrg) {
      setError('Please select an organization.');
      return;
    }

    try {
      // If your backend expects organization_id as a query parameter:
      await axios.post(
        `/services?organization_id=${selectedOrg}`,
        {
          name,
          description,
          location,
          contact_email,
          contact_phone,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      // After successful creation, navigate back to the services list
      navigate('/services');
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err.response?.data?.detail || 'Failed to create service');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Create Service
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Organization dropdown */}
          <FormControl variant="outlined" margin="normal" fullWidth>
            <InputLabel id="org-label">Organization</InputLabel>
            <Select
              labelId="org-label"
              label="Organization"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <MenuItem value="">
                <em>-- Select an Organization --</em>
              </MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Name"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Location"
            variant="outlined"
            margin="normal"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label="Contact Email"
            variant="outlined"
            margin="normal"
            type="email"
            fullWidth
            value={contact_email}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <TextField
            label="Contact Phone"
            variant="outlined"
            margin="normal"
            fullWidth
            value={contact_phone}
            onChange={(e) => setContactPhone(e.target.value)}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Create
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default CreateService;
