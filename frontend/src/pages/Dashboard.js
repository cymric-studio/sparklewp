import React from 'react';
import { useAuth } from '../services/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const containerStyle = {
    padding: '24px',
    background: '#f5f5f5',
    minHeight: '100vh'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: '#718096',
    marginBottom: '24px'
  };

  const welcomeCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '32px',
    color: 'white',
    marginBottom: '24px',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
  };

  const welcomeTextStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };

  const welcomeSubtextStyle = {
    fontSize: '16px',
    opacity: 0.9
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const statIconStyle = {
    fontSize: '32px',
    marginBottom: '12px'
  };

  const statTitleStyle = {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '8px'
  };

  const statValueStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d3748'
  };

  const actionsCardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const actionsHeaderStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '16px'
  };

  const actionButtonStyle = {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    marginRight: '12px',
    marginBottom: '12px',
    transition: 'background-color 0.2s',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Dashboard</h1>
        <p style={subtitleStyle}>Overview of your SparkleWP management system</p>
      </div>

      <div style={welcomeCardStyle}>
        <div style={welcomeTextStyle}>
          Welcome back, {user?.username || 'Admin'}! 👋
        </div>
        <div style={welcomeSubtextStyle}>
          Here's what's happening with your WordPress sites today.
        </div>
      </div>

      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle}>🌐</div>
          <div style={statTitleStyle}>Total Sites</div>
          <div style={statValueStyle}>5</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle}>👥</div>
          <div style={statTitleStyle}>Active Users</div>
          <div style={statValueStyle}>12</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle}>📊</div>
          <div style={statTitleStyle}>Updates Available</div>
          <div style={statValueStyle}>3</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle}>🔒</div>
          <div style={statTitleStyle}>Security Score</div>
          <div style={statValueStyle}>98%</div>
        </div>
      </div>

      <div style={actionsCardStyle}>
        <div style={actionsHeaderStyle}>Quick Actions</div>
        <button
          style={actionButtonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          Add New Site
        </button>
        <button
          style={actionButtonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          Run Updates
        </button>
        <button
          style={actionButtonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          Security Scan
        </button>
        <button
          style={actionButtonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          View Reports
        </button>
      </div>
    </div>
  );
} 