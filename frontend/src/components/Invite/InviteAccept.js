import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import {
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Box,
    Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const InviteAccept = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inviteData, setInviteData] = useState(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid invitation link');
            setLoading(false);
            return;
        }
        verifyInvite();
    }, [token, isAuthenticated]);

    const verifyInvite = async () => {
        try {
            console.log('Verifying token:', token);
            const response = await axios.post(`/notifications/invite/verify/${token}`);
            console.log('Verification response:', response.data);
            
            if (!response.data) {
                throw new Error('Invalid response from server');
            }

            // Always check authentication first
            if (!isAuthenticated) {
                console.log('User not authenticated, redirecting to login');
                const currentPath = `/invite/accept/${token}`;
                navigate('/login', {
                    state: {
                        email: response.data.target_email,
                        redirectAfterAuth: currentPath
                    },
                    replace: true
                });
                return;
            }

            // If user is authenticated but email doesn't match
            if (user && user.email !== response.data.target_email) {
                setError('This invitation was sent to a different email address');
                setLoading(false);
                return;
            }

            setInviteData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Verification error:', err);
            handleError(err);
        }
    };

    const handleError = (err) => {
        console.error('Error:', err);
        if (err.response) {
            if (err.response.status === 404) {
                setError('Invalid or expired invitation');
            } else {
                const errorMessage = err.response?.data?.detail || err.message || 'Failed to process invitation';
                setError(errorMessage);
            }
        } else {
            setError('Failed to process invitation');
        }
        setLoading(false);
    };

    const handleAccept = async () => {
        try {
            setLoading(true);
            console.log('Accepting invitation with token:', token);
            
            const response = await axios.post(`/notifications/invite/accept/${token}`);
            
            if (response.data && response.data.organization_id) {
                navigate(`/organizations/${response.data.organization_id}`, {
                    state: { 
                        message: 'Successfully joined organization',
                        severity: 'success'
                    }
                });
            } else {
                navigate('/notifications', { 
                    state: { 
                        message: 'Invitation accepted successfully',
                        severity: 'success'
                    }
                });
            }
        } catch (err) {
            handleError(err);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Box mt={4}>
                    <Alert severity="error">{error}</Alert>
                    <Box mt={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/notifications')}
                            fullWidth
                        >
                            Return to Notifications
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }

    if (!inviteData) {
        return (
            <Container maxWidth="sm">
                <Box mt={4}>
                    <Alert severity="error">No invitation data found</Alert>
                    <Box mt={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/notifications')}
                            fullWidth
                        >
                            Return to Notifications
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }

    const entityInfo = inviteData?.entity_info || {};
    const organizationName = inviteData?.organization?.name || entityInfo.entity_name;
    const role = inviteData?.extra_data?.role || entityInfo.role || 'User';

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Organization Invitation
                </Typography>
                
                <Typography variant="body1" paragraph>
                    You have been invited to join <strong>{organizationName}</strong>.
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                    <Chip 
                        label={`Role: ${role}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                <Box mt={3} display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleAccept}
                        disabled={loading}
                    >
                        Accept Invitation
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/notifications')}
                        disabled={loading}
                    >
                        Back to Notifications
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default InviteAccept; 