// src/components/Services/ServiceList.js
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ServiceList = () => {
    const { authToken } = useContext(AuthContext);
    const [services, setServices] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Call the new endpoint:
                const response = await axios.get('/services/all', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setServices(response.data);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError(err.response?.data?.detail || 'Failed to fetch services');
            }
        };

        fetchServices();
    }, [authToken]);

    const handleDelete = async (serviceId) => {
        // If you want to keep a global "delete" logic, that’s up to you
    };

    return (
        <Container maxWidth="lg">
            <Box mt={5} mb={3} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">All Services</Typography>
                <Button variant="contained" color="primary" component={Link} to="/services/create">
                    Create Service
                </Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Service Name</TableCell>
                            <TableCell>Organization</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>{service.name}</TableCell>
                                <TableCell>
                                  {/* Show the org name from service.organization */}
                                  {service.organization?.name ?? '—'}
                                </TableCell>
                                <TableCell>{service.description}</TableCell>
                                <TableCell>{new Date(service.created_at).toLocaleString()}</TableCell>
                                <TableCell>
                                    <IconButton
                                      component={Link}
                                      to={`/services/update/${service.id}?organization_id=${service.organization_id}`}
                                      color="primary"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleDelete(service.id)}
                                      color="secondary"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {services.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No services found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ServiceList;
