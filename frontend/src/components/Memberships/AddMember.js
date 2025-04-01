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
    Select, 
    MenuItem, 
    InputLabel, 
    FormControl, 
    Alert,
    Box,
    Switch,
    FormControlLabel,
    Typography
} from '@mui/material';
import UserSelect from '../Users/UserSelect';

const AddMember = ({ organizationId, refreshOrganization }) => {
    const { authToken } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendInvite, setSendInvite] = useState(true);

    const handleAdd = async () => {
        if (!selectedUser) {
            setError('Please select a user');
            return;
        }

        setError('');
        setLoading(true);
        try {
            if (sendInvite) {
                // Send invitation notification
                await axios.post(`/notifications/`, {
                    type: 'ORGANIZATION_INVITE',
                    user_id: selectedUser.id,
                    title: 'Organization Invitation',
                    message: `You have been invited to join an organization as ${role}`,
                    organization_id: organizationId,
                    extra_data: JSON.stringify({ role })
                });
                setOpen(false);
                setSelectedUser(null);
                setRole('user');
                refreshOrganization();
            } else {
                // Add member directly
                await axios.post(`/organizations/${organizationId}/memberships/`, {
                    user_id: selectedUser.id,
                    role,
                });
                setOpen(false);
                setSelectedUser(null);
                setRole('user');
                refreshOrganization();
            }
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data.detail || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
        setRole('user');
        setError('');
    };

    return (
        <>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Add Member
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ mb: 2, mt: 1 }}>
                        <UserSelect
                            value={selectedUser}
                            onChange={setSelectedUser}
                            label="Select User"
                        />
                    </Box>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            label="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="business_owner">Business Owner</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={sendInvite}
                                onChange={(e) => setSendInvite(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Send invitation instead of adding directly
                            </Typography>
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAdd} 
                        variant="contained" 
                        color="primary"
                        disabled={loading || !selectedUser}
                    >
                        {loading ? 'Adding...' : (sendInvite ? 'Send Invite' : 'Add Member')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddMember;
