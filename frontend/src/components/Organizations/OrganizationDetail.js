// src/components/Organizations/OrganizationDetail.js

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Button, Alert, Divider } from '@mui/material';
import MembershipsList from '../Memberships/MembershipsList';
import AddMember from '../Memberships/AddMember';
import { jwtDecode } from 'jwt-decode';

const OrganizationDetail = () => {
    const { authToken } = useContext(AuthContext);
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
                console.log('Organization data:', response.data);
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

    // Get user ID from JWT token
    const decodedToken = jwtDecode(authToken);
    const userId = parseInt(decodedToken.sub);
    console.log('Current user ID:', userId);
    console.log('Memberships:', organization.memberships);

    // Find the current user's membership by matching their ID
    const currentMembership = organization.memberships.find(m => m.user_id === userId);
    console.log('Current membership:', currentMembership);
    console.log('Current membership role type:', typeof currentMembership?.role);
    console.log('Current membership role value:', currentMembership?.role);
    
    const isAdmin = currentMembership?.role === 'admin';
    const isBusinessOwner = currentMembership?.role === 'business_owner';

    console.log('Role checks:', { 
        isAdmin, 
        isBusinessOwner, 
        role: currentMembership?.role,
        roleComparison: {
            adminCheck: currentMembership?.role === 'admin',
            businessOwnerCheck: currentMembership?.role === 'business_owner'
        }
    });

    const refreshOrganization = async () => {
        try {
            const response = await axios.get(`/organizations/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setOrganization(response.data);
        } catch (err) {
            console.error('Error refreshing organization:', err);
            setError(err.response?.data.detail || 'Failed to refresh organization data');
        }
    };

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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Members
                    </Typography>
                    {isAdmin && (
                        <AddMember 
                            organizationId={organizationId} 
                            refreshOrganization={refreshOrganization} 
                        />
                    )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <MembershipsList 
                    memberships={organization.memberships} 
                    organizationId={organizationId} 
                    isAdmin={isAdmin}
                    refreshOrganization={refreshOrganization}
                />
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
