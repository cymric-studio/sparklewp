import React, { useState } from 'react';
import {
  Paper,
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Center,
  Alert,
  LoadingOverlay,
  Box
} from '@mantine/core';
import { IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-react';
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <Container size={460} my={40}>
        <Paper
          withBorder
          shadow="xl"
          p={40}
          mt={30}
          radius="xl"
          style={{ position: 'relative' }}
        >
          <LoadingOverlay visible={loading} overlayBlur={2} />

          <Center mb="xl">
            <Stack align="center" spacing="md">
              <Title order={2} size="h1" weight={700} color="dark">
                Welcome back
              </Title>
              <Text color="dimmed" size="lg">
                Sign in to your SparkleWP account
              </Text>
            </Stack>
          </Center>

          <form onSubmit={handleSubmit}>
            <Stack spacing="lg">
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  radius="xl"
                  styles={{
                    root: {
                      padding: '16px 20px'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                size="lg"
                radius="md"
                style={{ fontWeight: 500 }}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
                radius="md"
                visibilityToggleIcon={({ reveal, size }) =>
                  reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                }
              />

              <Button
                type="submit"
                loading={loading}
                size="lg"
                mt="xl"
                radius="xl"
                px="xl"
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 0,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    }
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 