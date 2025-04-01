// src/App.js

import React, { useContext } from 'react';
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
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import QueuesList from "./components/Queues/QueuesList";
import OrganizationsList from "./components/Organizations/OrganizationsList";
import DashboardPage from "./components/DashboardPage";
import QueueDetailWrapper from './components/Queues/QueueDetailWrapper';
import QueueAdmin from "./components/Queues/QueueAdmin"; // NEW: Import QueueDetailWrapper
import NotificationsMenu from './components/Notifications/NotificationsMenu';

const App = () => {
    const { authToken, logoutUser, user } = useContext(AuthContext); // Access AuthContext

    return (
        <Router>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': { color: 'inherit' },
                        }}
                    >
                        TimeWait
                    </Typography>
                    {authToken ? (
                        <Box display="flex" alignItems="center">
                            <Button color="inherit" component={Link} to="/services">
                                Services
                            </Button>
                            <Button color="inherit" component={Link} to="/queues">
                                Queues
                            </Button>
                            <Button color="inherit" component={Link} to="/organizations">
                                Organizations
                            </Button>
                            <NotificationsMenu />
                            <Button color="inherit" onClick={logoutUser}>
                                Logout
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button color="inherit" component={Link} to="/login">
                                Login
                            </Button>
                            <Button color="inherit" component={Link} to="/register">
                                Register
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

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
        </Router>
    );
};

export default App;
