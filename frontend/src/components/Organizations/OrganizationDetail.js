// src/components/Organizations/OrganizationDetail.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Button, Alert } from '@mui/material';
import MembershipsList from '../Memberships/MembershipsList';
import AddMember from '../Memberships/AddMember';

const OrganizationDetail = () => {
    const { authToken, user } = useContext(AuthContext);
    const { organizationId } = useParams();

    const [organization, setOrganization] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await axios.get(`/organizations/${organizationId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setOrganization(response.data);
            } catch (err) {
                console.error('Error fetching organization:', err);
                setError(err.response?.data.detail || 'Failed to fetch organization');
            }
        };

        fetchOrganization();
    }, [organizationId, authToken]);

    if (error) {
        return (
            <Container maxWidth="md">
                <Box mt={5}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </Container>
        );
    }

    if (!organization) {
        return (
            <Container maxWidth="md">
                <Box mt={5}>
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }

    // Determine if the current user has ADMIN or BUSINESS_OWNER role
    const currentMembership = organization.memberships.find(m => m.user_id === user?.sub);
    const isAdmin = currentMembership && currentMembership.role === 'ADMIN';
    const isBusinessOwner = currentMembership && currentMembership.role === 'BUSINESS_OWNER';

    return (
        <Container maxWidth="md">
            <Box mt={5} mb={3}>
                <Typography variant="h4" gutterBottom>
                    {organization.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {organization.description}
                </Typography>
                {(isAdmin || isBusinessOwner) && (
                    <Button variant="contained" color="primary" component={Link} to={`/organizations/${organizationId}/services/create`}>
                        Add Service
                    </Button>
                )}
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Members
                </Typography>
                {(isAdmin) && <AddMember organizationId={organizationId} refreshOrganization={() => {
                    // Re-fetch organization data to update memberships
                    axios.get(`/organizations/${organizationId}`, {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }).then(response => setOrganization(response.data)).catch(err => console.error(err));
                }} />}
                <MembershipsList memberships={organization.memberships} organizationId={organizationId} isAdmin={isAdmin} />
            </Paper>

            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Services
                </Typography>
                <List>
                    {organization.services.map(service => (
                        <ListItem key={service.id} divider button component={Link} to={`/services/${service.id}`}>
                            <ListItemText
                                primary={service.name}
                                secondary={service.description}
                            />
                        </ListItem>
                    ))}
                    {organization.services.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No services found." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default OrganizationDetail;
