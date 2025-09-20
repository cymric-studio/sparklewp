import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app and provide authentication state
export function AuthProvider({ children }) {
  // user: stores the authenticated user's info
  const [user, setUser] = useState(null);
  // token: stores the JWT token
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch user info from backend if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [token]);

  // Fetch the current user info from backend using the token
  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      // Token might be invalid/expired, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function: sets token and user, and saves to localStorage
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Logout function: clears token and user from state and localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Provide user, token, login, logout, and loading to the rest of the app
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
} 