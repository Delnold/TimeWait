// src/App.js

import React, { useContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext'; // Import AuthContext
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ServiceList from './components/Services/ServiceList';
import CreateService from './components/Services/CreateService';
import UpdateService from './components/Services/UpdateService';
import CreateQueue from './components/Queues/CreateQueue';
import UpdateQueue from './components/Queues/UpdateQueue';
import MainPage from './components/MainPage';
import PrivateRoute from './components/PrivateRoute';
import CreateOrganization from './components/Organizations/CreateOrganization';
import OrganizationDetail from './components/Organizations/OrganizationDetail';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, ThemeProvider, CssBaseline } from '@mui/material';
import QueuesList from "./components/Queues/QueuesList";
import OrganizationsList from "./components/Organizations/OrganizationsList";
import DashboardPage from "./components/DashboardPage";
import QueueDetailWrapper from './components/Queues/QueueDetailWrapper';
import QueueAdmin from "./components/Queues/QueueAdmin"; // NEW: Import QueueDetailWrapper
import NotificationsMenu from './components/Notifications/NotificationsMenu';
import InviteAccept from './components/Invite/InviteAccept';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import getTheme from './theme';

const App = () => {
    const { authToken, logoutUser, user } = useContext(AuthContext); // Access AuthContext
    const [mode, setMode] = useState('light');

    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar 
                    position="fixed" 
                    elevation={0}
                    sx={{ 
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        borderRadius: 0,
                        width: '100%',
                        left: 0,
                        right: 0,
                        top: 0
                    }}
                >
                    <Toolbar 
                        disableGutters 
                        sx={{ 
                            minHeight: { xs: 64, sm: 70 }, 
                            px: { xs: 2, sm: 4 },
                            borderRadius: 0
                        }}
                    >
                        <Typography
                            variant="h4"
                            component={Link}
                            to="/"
                            sx={{
                                flexGrow: 1,
                                textDecoration: 'none',
                                color: 'inherit',
                                fontWeight: 700,
                                letterSpacing: '-0.5px',
                                '&:hover': { 
                                    color: 'inherit',
                                    opacity: 0.9 
                                },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            TimeWait
                        </Typography>
                        <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={1}
                        >
                            <IconButton 
                                color="inherit" 
                                onClick={toggleTheme}
                                sx={{
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                            {authToken ? (
                                <Box 
                                    display="flex" 
                                    alignItems="center" 
                                    gap={1}
                                    sx={{
                                        '& .MuiButton-root': {
                                            px: 2,
                                            py: 1,
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }
                                        }
                                    }}
                                >
                                    <Button 
                                        color="inherit" 
                                        component={Link} 
                                        to="/services"
                                        sx={{ 
                                            display: { xs: 'none', sm: 'flex' },
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        Services
                                    </Button>
                                    <Button 
                                        color="inherit" 
                                        component={Link} 
                                        to="/queues"
                                        sx={{ 
                                            display: { xs: 'none', sm: 'flex' },
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        Queues
                                    </Button>
                                    <Button 
                                        color="inherit" 
                                        component={Link} 
                                        to="/organizations"
                                        sx={{ 
                                            display: { xs: 'none', sm: 'flex' },
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        Organizations
                                    </Button>
                                    <NotificationsMenu />
                                    <Button 
                                        color="inherit" 
                                        onClick={logoutUser}
                                        sx={{
                                            borderLeft: { sm: 1 },
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            ml: { sm: 2 },
                                            pl: { sm: 2 }
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Box 
                                    display="flex" 
                                    alignItems="center" 
                                    gap={1}
                                    sx={{
                                        '& .MuiButton-root': {
                                            px: 2,
                                            py: 1,
                                            fontSize: '0.95rem',
                                            fontWeight: 500
                                        }
                                    }}
                                >
                                    <Button 
                                        color="inherit" 
                                        component={Link} 
                                        to="/login"
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="secondary"
                                        component={Link} 
                                        to="/register"
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'secondary.dark',
                                            }
                                        }}
                                    >
                                        Register
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box component="main" sx={{ pt: { xs: 8, sm: 9 } }}>
                    <Routes>
                        <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/invite/accept/:token" element={<InviteAccept />} />

                        {/* NEW: Queue Detail Route */}
                        <Route path="/queues/:queueId" element={<PrivateRoute><QueueDetailWrapper /></PrivateRoute>} />

                        {/* Services Routes */}
                        <Route path="/services" element={<PrivateRoute><ServiceList /></PrivateRoute>} />
                        <Route path="/services/create" element={<PrivateRoute><CreateService /></PrivateRoute>} />
                        <Route path="/services/update/:serviceId" element={<PrivateRoute><UpdateService /></PrivateRoute>} />

                        {/* Queues Routes */}
                        <Route path="/queues" element={<PrivateRoute><QueuesList /></PrivateRoute>} />
                        <Route path="/queues/create" element={<PrivateRoute><CreateQueue /></PrivateRoute>} />
                        <Route path="/queues/update/:queueId" element={<PrivateRoute><UpdateQueue /></PrivateRoute>} />

                        {/* Organizations Routes */}
                        <Route path="/organizations" element={<PrivateRoute><OrganizationsList/></PrivateRoute>} />
                        <Route path="/organizations/create" element={<PrivateRoute><CreateOrganization /></PrivateRoute>} />
                        <Route path="/organizations/:organizationId" element={<PrivateRoute><OrganizationDetail /></PrivateRoute>} />
                        <Route
                            path="/queues/:queueId/admin"
                            element={
                                <PrivateRoute>
                                    <QueueAdmin/>
                                </PrivateRoute>
                            }
                        />
                        {/* Catch-All Route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;
