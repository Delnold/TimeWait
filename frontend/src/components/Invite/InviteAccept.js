import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import {
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';

const InviteAccept = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inviteData, setInviteData] = useState(null);

    useEffect(() => {
        verifyInvite();
    }, [token]);

    const verifyInvite = async () => {
        try {
            const response = await axios.post(`/notifications/invite/verify/${token}`);
            setInviteData(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired invitation');
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            setLoading(true);
            await axios.post(`/notifications/invite/accept/${token}`);
            navigate('/dashboard', { 
                state: { 
                    message: 'Successfully joined the organization!',
                    severity: 'success'
                }
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to accept invitation');
            setLoading(false);
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
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Organization Invitation
                </Typography>
                
                <Typography variant="body1" paragraph>
                    You have been invited to join <strong>{inviteData?.organization?.name}</strong>.
                </Typography>

                <Typography variant="body1" paragraph>
                    Role: <strong>{inviteData?.extra_data?.role || 'User'}</strong>
                </Typography>

                <Box mt={3}>
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
                </Box>
            </Paper>
        </Container>
    );
};

export default InviteAccept; 