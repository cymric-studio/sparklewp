import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app and provide authentication state
export function AuthProvider({ children }) {
  // user: stores the authenticated user's info
  const [user, setUser] = useState(null);
  // token: stores the JWT token
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Fetch user info from backend if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
    }
    // eslint-disable-next-line
  }, [token]);

  // Fetch the current user info from backend using the token
  const fetchUser = async () => {
    try {
      // You can create a /api/auth/me endpoint for real user info
      // For now, decode from token or use localStorage
      // We'll just keep the user info in localStorage for this demo
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
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

  // Provide user, token, login, and logout to the rest of the app
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
} 