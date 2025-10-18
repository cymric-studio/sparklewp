import React, { useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Input, PasswordInput, Button, Card } from '../components/ui';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-5">
      <div className="w-full max-w-[460px] my-10">
        <Card shadow="xl" padding="xl" className="relative border border-gray-200 dark:border-gray-700">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome back
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Sign in to your SparkleWP account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl">
                <IconAlertCircle size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-800 dark:text-gray-200">{error}</p>
              </div>
            )}

            {/* Username Input */}
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="text-base"
            />

            {/* Password Input */}
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-base"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="gradient"
              color="brand"
              size="lg"
              fullWidth
              className="mt-8"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
