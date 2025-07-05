import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from '../components/Sidebar';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Login from '../pages/Login';
import { useAuth } from '../services/AuthContext';

const { Content } = Layout;

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

  // If authenticated, show the full layout with sidebar and content
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar navigation for authenticated users */}
      <Sidebar />
      <Layout>
        <Content style={{ margin: '24px 16px 0' }}>
          {/* Define protected routes */}
          <Routes>
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            {/* Redirect any unknown route to dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
} 