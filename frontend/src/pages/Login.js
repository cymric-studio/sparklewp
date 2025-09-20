import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    navigate('/');
    return null;
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      // Call backend login endpoint using configured api
      const res = await api.post('/api/auth/login', { username, password });
      // Save token and user info in context/localStorage
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '14px'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const inputFocusStyle = {
    borderColor: '#667eea'
  };

  const passwordContainerStyle = {
    position: 'relative'
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '14px'
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '14px',
    background: loading ? '#999' : '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  };

  const errorStyle = {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Welcome back</h2>
        <p style={subtitleStyle}>Sign in to your SparkleWP account</p>

        <form style={formStyle} onSubmit={handleSubmit}>
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle} htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = inputFocusStyle.borderColor}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="password">
              Password
            </label>
            <div style={passwordContainerStyle}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = inputFocusStyle.borderColor}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                placeholder="Enter your password"
              />
              <button
                type="button"
                style={eyeButtonStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={submitButtonStyle}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#5a67d8';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#667eea';
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
} 