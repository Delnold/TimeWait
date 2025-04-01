import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Badge,
    IconButton
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

const NotificationsMenu = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const { authToken } = useContext(AuthContext);

    const fetchNotifications = async () => {
        try {
            const [notificationsResponse, countResponse] = await Promise.all([
                axios.get('/notifications/'),
                axios.get('/notifications/unread-count')
            ]);
            setNotifications(notificationsResponse.data);
            setUnreadCount(countResponse.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [authToken]);

    const handleAccept = async (notificationId) => {
        setLoading(true);
        try {
            await axios.post(`/notifications/${notificationId}/accept`);
            fetchNotifications();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (notificationId) => {
        setLoading(true);
        try {
            await axios.post(`/notifications/${notificationId}/reject`);
            fetchNotifications();
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = parseISO(dateString);
            const now = new Date();
            const diffInHours = Math.abs(now - date) / 36e5;

            if (diffInHours < 24) {
                return formatDistanceToNow(date, { addSuffix: true });
            } else {
                return format(date, 'MMM d, yyyy h:mm a');
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const renderNotification = (notification) => {
        const isPending = notification.status === 'PENDING';
        const isInvite = notification.type === 'ORGANIZATION_INVITE';

        return (
            <ListItem
                key={notification.id}
                sx={{
                    bgcolor: notification.status === 'PENDING' ? 'action.hover' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1
                }}
            >
                <ListItemText
                    primary={
                        <Typography variant="subtitle2">
                            {notification.title}
                        </Typography>
                    }
                    secondary={
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.primary">
                                {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.created_at)}
                            </Typography>
                        </Stack>
                    }
                />
                {isPending && (
                    <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
                        {isInvite ? (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleAccept(notification.id)}
                                    disabled={loading}
                                >
                                    Accept
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleReject(notification.id)}
                                    disabled={loading}
                                >
                                    Reject
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="small"
                                variant="text"
                                color="primary"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={loading}
                            >
                                Mark as Read
                            </Button>
                        )}
                    </Stack>
                )}
            </ListItem>
        );
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <IconButton
                color="inherit"
                onClick={() => setExpanded(!expanded)}
                size="large"
            >
                <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            right: -3,
                            top: 3,
                        }
                    }}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            {expanded && (
                <Paper 
                    elevation={3} 
                    sx={{ 
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        width: '300px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        mt: 1,
                        zIndex: 1300
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Notifications
                        </Typography>
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        {!loading && notifications.length === 0 && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    No notifications
                                </Typography>
                            </Box>
                        )}
                        {!loading && notifications.length > 0 && (
                            <List sx={{ p: 0 }}>
                                {notifications.map(renderNotification)}
                            </List>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default NotificationsMenu; 