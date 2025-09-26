import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Group,
  Stack,
  Button,
  ActionIcon,
  UnstyledButton,
  Box,
  Divider
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconWorld,
  IconLogout,
  IconSun,
  IconMoonStars
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { colorScheme, toggleColorScheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconDashboard },
    { path: '/websites', label: 'Websites', icon: IconWorld },
    { path: '/users', label: 'Users', icon: IconUsers }
  ];

  return (
    <Box
      style={{
        width: 250,
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: colorScheme === 'dark'
          ? 'linear-gradient(180deg, #2c2e33 0%, #1a1b1e 100%)'
          : 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        zIndex: 1000,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Box
        p="md"
        mb="md"
        style={{
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Title
          order={2}
          size="h3"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'white'
          }}
        >
          SparkleWP
        </Title>
      </Box>

      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <Stack spacing="xs">
          {navItems.map((item) => (
            <UnstyledButton
              key={item.path}
              component={Link}
              to={item.path}
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '218px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.8)',
                backgroundColor: location.pathname === item.path
                  ? 'rgba(102, 126, 234, 0.8)'
                  : 'transparent',
                transition: 'all 0.2s',
                borderLeft: location.pathname === item.path
                  ? '3px solid #667eea'
                  : '3px solid transparent',
                overflow: 'hidden'
              }}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: location.pathname === item.path
                      ? 'rgba(102, 126, 234, 0.9)'
                      : 'rgba(255,255,255,0.1)'
                  }
                }
              }}
            >
              <Group spacing="sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <Text size="sm" weight={500} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </Text>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </Box>

      <Box>
        <Divider mb="md" color="rgba(255,255,255,0.1)" />

        <Group position="apart" mb="md">
          <Text size="sm" color="rgba(255,255,255,0.7)">
            Theme
          </Text>
          <ActionIcon
            onClick={toggleColorScheme}
            size="lg"
            variant="light"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white'
            }}
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
          </ActionIcon>
        </Group>

        <Text size="sm" color="rgba(255,255,255,0.7)" mb="md">
          Welcome back, {user?.username || 'Admin'}!
        </Text>

        <Button
          leftIcon={<IconLogout size={16} />}
          variant="light"
          fullWidth
          onClick={handleLogout}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none'
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
} 