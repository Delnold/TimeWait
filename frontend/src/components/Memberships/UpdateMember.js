// src/components/Memberships/UpdateMember.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Alert,
    Box,
    Typography
} from '@mui/material';

const UpdateMember = ({ open, handleClose, membership, organizationId, refreshOrganization }) => {
    const { authToken } = useContext(AuthContext);
    const [role, setRole] = useState(membership.role);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setError('');
        setLoading(true);
        try {
            await axios.put(`/organizations/${organizationId}/memberships/${membership.user_id}`, {
                role,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            handleClose();
            refreshOrganization();
        } catch (err) {
            console.error('Error updating member:', err);
            setError(err.response?.data.detail || 'Failed to update member');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'Admin';
            case 'business_owner':
                return 'Business Owner';
            default:
                return 'User';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Update Member Role</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box mb={2}>
                    <Typography variant="body1" gutterBottom>
                        Updating role for {membership.user.name}
                    </Typography>
                </Box>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="update-role-label">Role</InputLabel>
                    <Select
                        labelId="update-role-label"
                        label="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="business_owner">Business Owner</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button 
                    onClick={handleUpdate} 
                    variant="contained" 
                    color="primary"
                    disabled={loading || role === membership.role}
                >
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateMember;
