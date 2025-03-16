import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const UpdateService = () => {
  const { authToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const query = useQuery();
  const organization_id = query.get("organization_id");

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact_email, setContactEmail] = useState('');
  const [contact_phone, setContactPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Include organization_id as a query parameter
        const response = await axios.get(`/services/${serviceId}?organization_id=${organization_id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = response.data;
        setName(data.name);
        setDescription(data.description || '');
        setLocation(data.location || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err.response?.data.detail || 'Failed to fetch service');
      }
    };

    if (organization_id) {
      fetchService();
    } else {
      setError('Organization ID is missing in the URL.');
    }
  }, [serviceId, organization_id, authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // When updating, you might also want to include organization_id in the PUT request URL if required by your API
      await axios.put(`/services/${serviceId}?organization_id=${organization_id}`, {
        name,
        description,
        location,
        contact_email,
        contact_phone,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      navigate('/services');
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data.detail || 'Failed to update service');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Update Service
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
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
            Update
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default UpdateService;
