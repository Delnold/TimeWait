// src/components/Memberships/AddMember.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Select, 
    MenuItem, 
    InputLabel, 
    FormControl, 
    Alert,
    Box,
    Typography
} from '@mui/material';

const AddMember = ({ organizationId, refreshOrganization }) => {
    const { authToken } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setError('');
        if (!userId.trim()) {
            setError('User ID is required');
            return;
        }
        
        setLoading(true);
        try {
            await axios.post(`/organizations/${organizationId}/memberships/`, {
                user_id: parseInt(userId),
                role,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setOpen(false);
            setUserId('');
            setRole('user');
            refreshOrganization();
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data.detail || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'business_owner':
                return 'Business Owner';
            case 'user':
                return 'User';
            default:
                return role;
        }
    };

    return (
        <>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpen(true)}
                startIcon={<span>+</span>}
            >
                Add Member
            </Button>
            <Dialog 
                open={open} 
                onClose={() => !loading && setOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                            Enter the ID of the user you want to add to this organization.
                            The user must already have an account in the system.
                        </Typography>
                    </Box>
                    <TextField
                        label="User ID"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        type="number"
                        disabled={loading}
                        autoFocus
                    />
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            label="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={loading}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="business_owner">Business Owner</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAdd} 
                        variant="contained" 
                        color="primary"
                        disabled={loading || !userId.trim()}
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddMember;
