// src/components/Memberships/AddMember.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, Alert } from '@mui/material';

const AddMember = ({ organizationId, refreshOrganization }) => {
    const { authToken } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');

    const handleAdd = async () => {
        setError('');
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
            setRole('USER');
            refreshOrganization();
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data.detail || 'Failed to add member');
        }
    };

    return (
        <>
            <Button variant="outlined" color="primary" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                Add Member
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="User ID"
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        type="number"
                    />
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
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
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained" color="primary">Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddMember;
