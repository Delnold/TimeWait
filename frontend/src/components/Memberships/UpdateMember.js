// src/components/Memberships/UpdateMember.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';

const UpdateMember = ({ open, handleClose, membership, organizationId }) => {
    const { authToken } = useContext(AuthContext);
    const [role, setRole] = useState(membership.role);
    const [error, setError] = useState('');

    const handleUpdate = async () => {
        setError('');
        try {
            await axios.put(`/organizations/${organizationId}/memberships/${membership.user_id}`, {
                role,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            handleClose();
            // Optionally, refresh the organization data
        } catch (err) {
            console.error('Error updating member:', err);
            setError(err.response?.data.detail || 'Failed to update member');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Update Member Role</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error">{error}</Alert>}
                <FormControl variant="outlined" margin="normal" fullWidth>
                    <InputLabel id="update-role-label">Role</InputLabel>
                    <Select
                        labelId="update-role-label"
                        label="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="BUSINESS_OWNER">Business Owner</MenuItem>
                        <MenuItem value="USER">User</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateMember;
