import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  Text,
  Card,
  Badge,
  LoadingOverlay,
  Box,
  Breadcrumbs,
  Anchor,
  Tabs,
  ActionIcon,
  Tooltip,
  Alert,
  Grid,
  Paper,
  Progress,
  Divider
} from '@mantine/core';
import {
  IconChevronLeft,
  IconPlugConnected,
  IconPalette,
  IconRefresh,
  IconExternalLink,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconDownload,
  IconTrash,
  IconSettings,
  IconInfoCircle
} from '@tabler/icons-react';
import api from '../services/api';

export default function WebsiteSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [websitePlugins, setWebsitePlugins] = useState([]);
  const [websiteThemes, setWebsiteThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('plugins');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWebsiteDetails();
  }, [id]);

  const fetchWebsiteDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/api/websites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const websiteData = res.data;
      setWebsite(websiteData);

      if (websiteData.detailedPlugins) {
        setWebsitePlugins(websiteData.detailedPlugins);
      } else {
        setWebsitePlugins([]);
      }

      if (websiteData.detailedThemes) {
        setWebsiteThemes(websiteData.detailedThemes);
      } else {
        setWebsiteThemes([]);
      }

    } catch (err) {
      console.error('Error fetching website details:', err);
      setError(err.response?.data?.message || 'Failed to fetch website details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/api/websites/${id}/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Website data refreshed successfully');
      // Refresh the page data
      await fetchWebsiteDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh website data');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getUpdateStats = (items) => {
    const total = items.length;
    const withUpdates = items.filter(item => item.update_available).length;
    const active = items.filter(item => item.active).length;

    return { total, withUpdates, active };
  };

  if (loading) {
    return (
      <Box pos="relative" mih="400px">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  if (!website) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Website Not Found" color="red">
          The website you're looking for doesn't exist or you don't have access to it.
        </Alert>
      </Container>
    );
  }

  const pluginStats = getUpdateStats(websitePlugins);
  const themeStats = getUpdateStats(websiteThemes);

  const breadcrumbItems = [
    { title: 'Websites', href: '/websites' },
    { title: website.name, href: null }
  ].map((item, index) => (
    item.href ? (
      <Anchor key={index} onClick={() => navigate(item.href)} style={{ cursor: 'pointer' }}>
        {item.title}
      </Anchor>
    ) : (
      <Text key={index}>{item.title}</Text>
    )
  ));

  return (
    <Box style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px 0 48px 0'
    }}>
      <Container size="xl" px="xl">
        <Stack spacing="xl">
          {/* Header */}
          <Card
            padding="xl"
            radius="xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Group position="apart" align="flex-start">
              <Stack spacing="sm">
                <Group spacing="md">
                  <ActionIcon
                    size="xl"
                    variant="light"
                    color="white"
                    onClick={() => navigate('/websites')}
                    styles={{
                      root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <IconChevronLeft size={24} />
                  </ActionIcon>
                  <Stack spacing="xs">
                    <Group spacing="md" align="center">
                      <Title order={1} style={{ color: 'white', fontSize: '2.25rem', fontWeight: 700, margin: 0 }}>
                        {website.name}
                      </Title>
                      <Badge
                        color={getStatusColor(website.status)}
                        variant="filled"
                        size="lg"
                        radius="xl"
                        style={{ textTransform: 'capitalize' }}
                      >
                        {website.status}
                      </Badge>
                    </Group>

                    <Breadcrumbs
                      separator="›"
                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                      styles={{
                        separator: { color: 'rgba(255, 255, 255, 0.6)' }
                      }}
                    >
                      {breadcrumbItems}
                    </Breadcrumbs>

                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                      {website.url}
                    </Text>
                  </Stack>
                </Group>
              </Stack>

              <Button
                leftIcon={<IconRefresh size={18} />}
                variant="white"
                loading={refreshing}
                onClick={handleRefresh}
                radius="xl"
                size="lg"
                px="xl"
                styles={{
                  root: {
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                    },
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Refresh Data
              </Button>
            </Group>
          </Card>

          {/* Alerts */}
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size="1rem" />} title="Success" color="green" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Stats Overview */}
          <Grid gutter="xl">
            <Grid.Col span={4}>
              <Paper
                padding="xl"
                radius="xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Group position="apart" align="flex-start">
                  <Stack spacing="sm">
                    <Text size="sm" color="dimmed" weight={600} style={{ letterSpacing: '0.5px' }}>
                      PLUGINS
                    </Text>
                    <Text size="2.5rem" weight={800} color="dark" style={{ lineHeight: 1, margin: '8px 0' }}>
                      {pluginStats.total}
                    </Text>
                    <Text size="sm" color="dimmed" style={{ lineHeight: 1.4 }}>
                      {pluginStats.active} active • {pluginStats.withUpdates} updates
                    </Text>
                  </Stack>
                  <Box style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)'
                  }}>
                    <IconPlugConnected size={28} style={{ color: '#6366f1' }} />
                  </Box>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={4}>
              <Paper
                padding="xl"
                radius="xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Group position="apart" align="flex-start">
                  <Stack spacing="sm">
                    <Text size="sm" color="dimmed" weight={600} style={{ letterSpacing: '0.5px' }}>
                      THEMES
                    </Text>
                    <Text size="2.5rem" weight={800} color="dark" style={{ lineHeight: 1, margin: '8px 0' }}>
                      {themeStats.total}
                    </Text>
                    <Text size="sm" color="dimmed" style={{ lineHeight: 1.4 }}>
                      {themeStats.active} active • {themeStats.withUpdates} updates
                    </Text>
                  </Stack>
                  <Box style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                  }}>
                    <IconPalette size={28} style={{ color: '#8b5cf6' }} />
                  </Box>
                </Group>
              </Paper>
            </Grid.Col>

            <Grid.Col span={4}>
              <Paper
                padding="xl"
                radius="xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Group position="apart" align="flex-start">
                  <Stack spacing="sm">
                    <Text size="sm" color="dimmed" weight={600} style={{ letterSpacing: '0.5px' }}>
                      WORDPRESS
                    </Text>
                    <Text size="2.5rem" weight={800} color="dark" style={{ lineHeight: 1, margin: '8px 0' }}>
                      {website.wpVersion || 'Unknown'}
                    </Text>
                    <Text size="sm" color="dimmed" style={{ lineHeight: 1.4 }}>
                      Last sync: {website.lastSync ? new Date(website.lastSync).toLocaleDateString() : 'Never'}
                    </Text>
                  </Stack>
                  <Box style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }}>
                    <IconInfoCircle size={28} style={{ color: '#10b981' }} />
                  </Box>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Tab Navigation */}
          <Card
            padding="lg"
            radius="xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Group spacing="lg" position="center">
              <Button
                variant={activeTab === 'plugins' ? 'filled' : 'light'}
                onClick={() => {
                  console.log('Switching to plugins tab');
                  setActiveTab('plugins');
                }}
                leftIcon={<IconPlugConnected size="1.1rem" />}
                rightIcon={
                  <Badge size="sm" variant={activeTab === 'plugins' ? 'light' : 'filled'} color="blue">
                    {pluginStats.total}
                  </Badge>
                }
                size="lg"
                radius="xl"
                px="xl"
                styles={{
                  root: {
                    backgroundColor: activeTab === 'plugins'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(102, 126, 234, 0.1)',
                    color: activeTab === 'plugins' ? 'white' : '#667eea',
                    border: activeTab === 'plugins' ? 'none' : '2px solid rgba(102, 126, 234, 0.2)',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: activeTab === 'plugins'
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                        : 'rgba(102, 126, 234, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Plugins
              </Button>
              <Button
                variant={activeTab === 'themes' ? 'filled' : 'light'}
                onClick={() => {
                  console.log('Switching to themes tab');
                  setActiveTab('themes');
                }}
                leftIcon={<IconPalette size="1.1rem" />}
                rightIcon={
                  <Badge size="sm" variant={activeTab === 'themes' ? 'light' : 'filled'} color="violet">
                    {themeStats.total}
                  </Badge>
                }
                size="lg"
                radius="xl"
                px="xl"
                styles={{
                  root: {
                    backgroundColor: activeTab === 'themes'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(139, 92, 246, 0.1)',
                    color: activeTab === 'themes' ? 'white' : '#8b5cf6',
                    border: activeTab === 'themes' ? 'none' : '2px solid rgba(139, 92, 246, 0.2)',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: activeTab === 'themes'
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                        : 'rgba(139, 92, 246, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                Themes
              </Button>
            </Group>
          </Card>

          {/* Main Content */}
          <Card
            padding="2rem"
            radius="xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(10px)'
            }}
          >

            {/* Plugins Content */}
            {activeTab === 'plugins' && (
              <Stack spacing="xl">
                <Group position="apart" align="center">
                  <Title order={2} style={{ color: '#1f2937', fontWeight: 700, fontSize: '1.75rem' }}>
                    Installed Plugins
                  </Title>
                  {pluginStats.withUpdates > 0 && (
                    <Button
                      variant="gradient"
                      gradient={{ from: 'orange', to: 'red' }}
                      size="md"
                      radius="xl"
                      px="xl"
                      styles={{
                        root: {
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)'
                          },
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      {pluginStats.withUpdates} Updates Available
                    </Button>
                  )}
                </Group>

                {websitePlugins.length === 0 ? (
                  <Alert
                    icon={<IconInfoCircle size="1.2rem" />}
                    color="blue"
                    radius="xl"
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    No plugins data available. Make sure the SparkleWP Connector plugin is installed and active on your WordPress site.
                  </Alert>
                ) : (
                  <Stack spacing="lg">
                    {websitePlugins.map((plugin, index) => (
                      <Card
                        key={index}
                        padding="xl"
                        radius="xl"
                        withBorder
                        style={{
                          border: '1px solid rgba(229, 231, 235, 0.8)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Group position="apart" align="flex-start">
                          <Stack spacing="sm" style={{ flex: 1 }}>
                            <Group spacing="sm" align="flex-start">
                              <Stack spacing="xs" style={{ flex: 1 }}>
                                <Group spacing="md" mb="sm">
                                  <Text weight={700} size="xl" style={{ color: '#1f2937', fontSize: '1.25rem' }}>
                                    {plugin.name}
                                  </Text>
                                  <Badge
                                    color={plugin.active ? 'green' : 'gray'}
                                    variant={plugin.active ? 'filled' : 'light'}
                                    size="md"
                                    radius="xl"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {plugin.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {plugin.network_active && (
                                    <Badge color="blue" variant="light" size="md" radius="xl">
                                      Network Active
                                    </Badge>
                                  )}
                                  {plugin.update_available && (
                                    <Badge
                                      color="orange"
                                      variant="gradient"
                                      gradient={{ from: 'orange', to: 'red' }}
                                      size="md"
                                      radius="xl"
                                      style={{ fontWeight: 600 }}
                                    >
                                      Update Available
                                    </Badge>
                                  )}
                                </Group>

                                <Text size="md" color="dimmed" lineClamp={2} style={{ marginBottom: '12px', lineHeight: 1.5 }}>
                                  {plugin.description || 'No description available.'}
                                </Text>

                                <Group spacing="xl">
                                  <Text size="sm" color="dimmed" style={{ fontWeight: 500 }}>
                                    Version: <strong style={{ color: '#374151' }}>{plugin.version}</strong>
                                    {plugin.update_available && plugin.latest_version && (
                                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                                        {' → '}<strong>{plugin.latest_version}</strong>
                                      </span>
                                    )}
                                  </Text>
                                  {plugin.author && (
                                    <Text size="sm" color="dimmed" style={{ fontWeight: 500 }}>
                                      Author: <strong style={{ color: '#374151' }}>{plugin.author}</strong>
                                    </Text>
                                  )}
                                </Group>
                              </Stack>
                            </Group>
                          </Stack>

                          <Group spacing="md">
                            {plugin.update_available && (
                              <Tooltip label="Update plugin" position="top">
                                <ActionIcon
                                  color="orange"
                                  variant="light"
                                  size="xl"
                                  radius="xl"
                                  styles={{
                                    root: {
                                      '&:hover': {
                                        backgroundColor: 'rgba(251, 146, 60, 0.2)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                >
                                  <IconDownload size={20} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Plugin settings" position="top">
                              <ActionIcon
                                color="gray"
                                variant="light"
                                size="xl"
                                radius="xl"
                                styles={{
                                  root: {
                                    '&:hover': {
                                      backgroundColor: 'rgba(107, 114, 128, 0.2)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }
                                }}
                              >
                                <IconSettings size={20} />
                              </ActionIcon>
                            </Tooltip>
                            {!plugin.active && (
                              <Tooltip label="Delete plugin" position="top">
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  size="xl"
                                  radius="xl"
                                  styles={{
                                    root: {
                                      '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                >
                                  <IconTrash size={20} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {/* Themes Content */}
            {activeTab === 'themes' && (
              <Stack spacing="xl">
                <Group position="apart" align="center">
                  <Title order={2} style={{ color: '#1f2937', fontWeight: 700, fontSize: '1.75rem' }}>
                    Installed Themes
                  </Title>
                  {themeStats.withUpdates > 0 && (
                    <Button
                      variant="gradient"
                      gradient={{ from: 'orange', to: 'red' }}
                      size="md"
                      radius="xl"
                      px="xl"
                      styles={{
                        root: {
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)'
                          },
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      {themeStats.withUpdates} Updates Available
                    </Button>
                  )}
                </Group>

                {websiteThemes.length === 0 ? (
                  <Alert
                    icon={<IconInfoCircle size="1.2rem" />}
                    color="blue"
                    radius="xl"
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    No themes data available. Make sure the SparkleWP Connector plugin is installed and active on your WordPress site.
                  </Alert>
                ) : (
                  <Stack spacing="lg">
                    {websiteThemes.map((theme, index) => (
                      <Card
                        key={index}
                        padding="xl"
                        radius="xl"
                        withBorder
                        style={{
                          border: '1px solid rgba(229, 231, 235, 0.8)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Group position="apart" align="flex-start">
                          <Stack spacing="sm" style={{ flex: 1 }}>
                            <Group spacing="sm" align="flex-start">
                              <Stack spacing="xs" style={{ flex: 1 }}>
                                <Group spacing="md" mb="sm">
                                  <Text weight={700} size="xl" style={{ color: '#1f2937', fontSize: '1.25rem' }}>
                                    {theme.name}
                                  </Text>
                                  <Badge
                                    color={theme.active ? 'green' : 'gray'}
                                    variant={theme.active ? 'filled' : 'light'}
                                    size="md"
                                    radius="xl"
                                    style={{ fontWeight: 600 }}
                                  >
                                    {theme.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {theme.update_available && (
                                    <Badge
                                      color="orange"
                                      variant="gradient"
                                      gradient={{ from: 'orange', to: 'red' }}
                                      size="md"
                                      radius="xl"
                                      style={{ fontWeight: 600 }}
                                    >
                                      Update Available
                                    </Badge>
                                  )}
                                </Group>

                                <Text size="md" color="dimmed" lineClamp={2} style={{ marginBottom: '12px', lineHeight: 1.5 }}>
                                  {theme.description || 'No description available.'}
                                </Text>

                                <Group spacing="xl">
                                  <Text size="sm" color="dimmed" style={{ fontWeight: 500 }}>
                                    Version: <strong style={{ color: '#374151' }}>{theme.version}</strong>
                                    {theme.update_available && theme.latest_version && (
                                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                                        {' → '}<strong>{theme.latest_version}</strong>
                                      </span>
                                    )}
                                  </Text>
                                  {theme.author && (
                                    <Text size="sm" color="dimmed" style={{ fontWeight: 500 }}>
                                      Author: <strong style={{ color: '#374151' }}>{theme.author}</strong>
                                    </Text>
                                  )}
                                </Group>
                              </Stack>
                            </Group>
                          </Stack>

                          <Group spacing="md">
                            {theme.update_available && (
                              <Tooltip label="Update theme" position="top">
                                <ActionIcon
                                  color="orange"
                                  variant="light"
                                  size="xl"
                                  radius="xl"
                                  styles={{
                                    root: {
                                      '&:hover': {
                                        backgroundColor: 'rgba(251, 146, 60, 0.2)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                >
                                  <IconDownload size={20} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Theme settings" position="top">
                              <ActionIcon
                                color="gray"
                                variant="light"
                                size="xl"
                                radius="xl"
                                styles={{
                                  root: {
                                    '&:hover': {
                                      backgroundColor: 'rgba(107, 114, 128, 0.2)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }
                                }}
                              >
                                <IconSettings size={20} />
                              </ActionIcon>
                            </Tooltip>
                            {!theme.active && (
                              <Tooltip label="Delete theme" position="top">
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  size="xl"
                                  radius="xl"
                                  styles={{
                                    root: {
                                      '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                >
                                  <IconTrash size={20} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}