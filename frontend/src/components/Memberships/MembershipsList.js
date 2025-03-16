// src/components/Memberships/MembershipsList.js

import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { List, ListItem, ListItemText, IconButton, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import UpdateMember from './UpdateMember';

const MembershipsList = ({ memberships, organizationId, isAdmin }) => {
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
            // Optionally, refresh the organization data
        } catch (err) {
            console.error('Error deleting member:', err);
            setError(err.response?.data.detail || 'Failed to delete member');
        }
    };

    return (
        <>
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {memberships.map(membership => (
                    <ListItem key={membership.id} divider>
                        <ListItemText
                            primary={membership.user.name}
                            secondary={`Role: ${membership.role}`}
                        />
                        <Chip label={membership.role} color={
                            membership.role === 'ADMIN' ? 'primary' :
                            membership.role === 'BUSINESS_OWNER' ? 'secondary' :
                            'default'
                        } />
                        {isAdmin && (
                            <>
                                <IconButton onClick={() => { setMemberToUpdate(membership); setOpenUpdate(true); }} color="primary">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => { setMemberToDelete(membership); setOpenDelete(true); }} color="error">
                                    <Delete />
                                </IconButton>
                            </>
                        )}
                    </ListItem>
                ))}
                {memberships.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No members found." />
                    </ListItem>
                )}
            </List>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove {memberToDelete?.user.name} from the organization?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Update Member Dialog */}
            {memberToUpdate && (
                <UpdateMember
                    open={openUpdate}
                    handleClose={() => setOpenUpdate(false)}
                    membership={memberToUpdate}
                    organizationId={organizationId}
                />
            )}
        </>
    );
};

export default MembershipsList;
