import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Login from '../pages/Login';
import { useAuth } from '../services/AuthContext';

// PrivateRoute component: Only renders children if user is authenticated
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Main App component
export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  // If not authenticated and not on login page, redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  // If on login page, only show the login form (hide sidebar/layout)
  if (location.pathname === '/login') {
    return (
      // Only render the login route
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Redirect any other route to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const contentStyle = {
    marginLeft: '250px', // Account for fixed sidebar width
    flex: 1,
    minHeight: '100vh',
    width: 'calc(100vw - 250px)',
    maxWidth: 'calc(100vw - 250px)',
    overflow: 'hidden'
  };

  // If authenticated, show the full layout with sidebar and content
  return (
    <div style={layoutStyle}>
      {/* Fixed Sidebar navigation for authenticated users */}
      <Sidebar />

      {/* Main content area */}
      <div style={contentStyle}>
        {/* Define protected routes */}
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          {/* Redirect any unknown route to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
} 