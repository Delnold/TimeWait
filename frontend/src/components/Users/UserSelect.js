import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { 
    Autocomplete, 
    TextField, 
    CircularProgress,
    Avatar,
    Box,
    Typography 
} from '@mui/material';
import { debounce } from 'lodash';

const UserSelect = ({ value, onChange, excludeUserIds = [], label = "Select User" }) => {
    const { authToken } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const response = await axios.get('/users/', {
                params: query ? { search: query } : {}
            });
            console.log('Users response:', response.data);
            // Filter out excluded users
            const filteredUsers = response.data.items.filter(
                user => !excludeUserIds.includes(user.id)
            );
            setOptions(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = React.useCallback(
        debounce((query) => fetchUsers(query), 300),
        [authToken, excludeUserIds]
    );

    useEffect(() => {
        if (open) {
            fetchUsers();
        } else {
            setOptions([]);
        }
    }, [open]);

    const handleInputChange = (event, newInputValue) => {
        setSearchQuery(newInputValue);
        debouncedSearch(newInputValue);
    };

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={value}
            onChange={(event, newValue) => onChange(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option) => option.name || ''}
            options={options}
            loading={loading}
            onInputChange={handleInputChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => (
                <li {...props}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                            sx={{ width: 32, height: 32 }}
                        >
                            {option.name[0].toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body1">
                                {option.name}
                            </Typography>
                            <Box display="flex" flexDirection="column">
                                <Typography variant="caption" color="text.secondary">
                                    {option.email}
                                </Typography>
                                {option.phone_number && (
                                    <Typography variant="caption" color="text.secondary">
                                        {option.phone_number}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </li>
            )}
            noOptionsText={loading ? "Loading..." : "No users found"}
        />
    );
};

export default UserSelect; 