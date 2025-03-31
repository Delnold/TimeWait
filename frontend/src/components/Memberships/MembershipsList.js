// src/components/Memberships/MembershipsList.js

import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { 
    List, 
    ListItem, 
    ListItemText, 
    IconButton, 
    Chip, 
    Alert, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button,
    Box,
    Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import UpdateMember from './UpdateMember';

const MembershipsList = ({ memberships, organizationId, isAdmin, refreshOrganization }) => {
    const { authToken } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [openDelete, setOpenDelete] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [memberToUpdate, setMemberToUpdate] = useState(null);

    const handleDelete = async () => {
        try {
            await axios.delete(`/organizations/${organizationId}/memberships/${memberToDelete.user_id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setMemberToDelete(null);
            setOpenDelete(false);
            refreshOrganization();
        } catch (err) {
            console.error('Error deleting member:', err);
            setError(err.response?.data.detail || 'Failed to delete member');
        }
    };

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'primary';
            case 'business_owner':
                return 'secondary';
            default:
                return 'default';
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
        <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <List>
                {memberships.map(membership => (
                    <ListItem 
                        key={membership.id} 
                        divider
                        secondaryAction={
                            isAdmin && (
                                <Box>
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => { setMemberToUpdate(membership); setOpenUpdate(true); }} 
                                        color="primary"
                                        sx={{ mr: 1 }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => { setMemberToDelete(membership); setOpenDelete(true); }} 
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            )
                        }
                    >
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1">
                                        {membership.user.name}
                                    </Typography>
                                    <Chip 
                                        label={membership.role} 
                                        color={
                                            membership.role === 'admin' ? 'primary' :
                                            membership.role === 'business_owner' ? 'secondary' :
                                            'default'
                                        }
                                        size="small"
                                    />
                                </Box>
                            }
                            secondary={membership.user.email}
                        />
                    </ListItem>
                ))}
                {memberships.length === 0 && (
                    <ListItem>
                        <ListItemText 
                            primary="No members found." 
                            secondary="Add members to your organization to get started."
                        />
                    </ListItem>
                )}
            </List>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Remove Member</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove {memberToDelete?.user.name} from the organization?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Member Dialog */}
            {memberToUpdate && (
                <UpdateMember 
                    open={openUpdate}
                    handleClose={() => {
                        setOpenUpdate(false);
                        setMemberToUpdate(null);
                    }}
                    membership={memberToUpdate}
                    organizationId={organizationId}
                    refreshOrganization={refreshOrganization}
                />
            )}
        </>
    );
};

export default MembershipsList;
