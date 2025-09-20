import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarStyle = {
    width: '250px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
  };

  const logoStyle = {
    padding: '24px 20px',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'white'
  };

  const navStyle = {
    flex: 1,
    padding: '20px 0'
  };

  const navItemStyle = {
    display: 'block',
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent',
    fontSize: '16px'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderLeftColor: '#667eea'
  };

  const bottomSectionStyle = {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '20px'
  };

  const welcomeStyle = {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '12px'
  };

  const logoutButtonStyle = {
    width: '100%',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  return (
    <div style={sidebarStyle}>
      <div style={logoStyle}>
        SparkleWP
      </div>

      <nav style={navStyle}>
        <Link
          to="/"
          style={location.pathname === '/' ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (location.pathname !== '/') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/users"
          style={location.pathname === '/users' ? activeNavItemStyle : navItemStyle}
          onMouseEnter={(e) => {
            if (location.pathname !== '/users') {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/users') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          👥 Users
        </Link>
      </nav>

      <div style={bottomSectionStyle}>
        <div style={welcomeStyle}>
          Welcome back, {user?.username || 'Admin'}!
        </div>
        <button
          style={logoutButtonStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
} 