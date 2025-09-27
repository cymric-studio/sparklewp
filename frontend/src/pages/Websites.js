import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  Select,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Alert,
  LoadingOverlay,
  Text,
  Box,
  Flex,
  Card,
  Grid,
  Textarea,
  PasswordInput
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconWorld,
  IconKey,
  IconShield,
  IconRefresh,
  IconEye,
  IconSettings,
  IconLink
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

export default function Websites() {
  const { token, user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [deletingWebsite, setDeletingWebsite] = useState(null);
  const [settingsWebsite, setSettingsWebsite] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState('plugins');
  const [websitePlugins, setWebsitePlugins] = useState([]);
  const [websiteThemes, setWebsiteThemes] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [connectingWebsite, setConnectingWebsite] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [connectionData, setConnectionData] = useState({
    method: 'application_password',
    username: '',
    password: '',
    apiKey: ''
  });

  const connectionMethods = [
    { value: 'application_password', label: 'Application Password (Recommended)' },
    { value: 'jwt_token', label: 'JWT Token' },
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth', label: 'OAuth (Coming Soon)', disabled: true }
  ];

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/websites', { headers: { Authorization: `Bearer ${token}` } });
      setWebsites(res.data);
    } catch (err) {
      setError('Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebsites(); }, []);

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.url) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      const res = await api.post('/api/websites', formData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Website added successfully. Please configure connection.');
      setModalOpen(false);
      setFormData({ name: '', url: '', description: '' });
      fetchWebsites(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add website');
    }
  };

  const handleConnectWebsite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!connectionData.username || !connectionData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const res = await api.post(`/api/websites/${connectingWebsite._id}/connect`, connectionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Website connected successfully!');
      setConnectModalOpen(false);
      setConnectingWebsite(null);
      setConnectionData({ method: 'application_password', username: '', password: '', apiKey: '' });
      fetchWebsites(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to website');
    }
  };

  const handleDeleteWebsite = async () => {
    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/websites/${deletingWebsite._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Website deleted successfully');
      setDeleteModalOpen(false);
      setDeletingWebsite(null);
      fetchWebsites(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete website');
    }
  };

  const handleTestConnection = async (website) => {
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/api/websites/${website._id}/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Connection test successful for ${website.name}. Site data refreshed.`);
      fetchWebsites(); // Refresh the list to show updated stats
    } catch (err) {
      setError(err.response?.data?.message || 'Connection test failed');
    }
  };

  const openConnectModal = (website) => {
    setConnectingWebsite(website);
    setConnectModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (website) => {
    setDeletingWebsite(website);
    setDeleteModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openSettingsModal = async (website) => {
    console.log('openSettingsModal called with website:', website);
    setSettingsWebsite(website);
    setSettingsModalOpen(true);
    setActiveSettingsTab('plugins');
    setSettingsLoading(true);
    setError('');
    setSuccess('');

    // Fetch detailed website information including plugins and themes
    try {
      console.log('Making API request to:', `/api/websites/${website._id}`);
      const res = await api.get(`/api/websites/${website._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API response:', res.data);
      const websiteData = res.data;

      // If we have detailed plugin/theme data from the SparkleWP connector
      if (websiteData.detailedPlugins) {
        console.log('Setting plugins:', websiteData.detailedPlugins);
        setWebsitePlugins(websiteData.detailedPlugins);
      } else {
        console.log('No detailedPlugins in response');
        setWebsitePlugins([]);
      }

      if (websiteData.detailedThemes) {
        console.log('Setting themes:', websiteData.detailedThemes);
        setWebsiteThemes(websiteData.detailedThemes);
      } else {
        console.log('No detailedThemes in response');
        setWebsiteThemes([]);
      }

    } catch (err) {
      console.error('Error fetching website details:', err);
      setError(err.response?.data?.message || 'Failed to fetch website details');
    } finally {
      setSettingsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setConnectModalOpen(false);
    setSettingsModalOpen(false);
    setEditingWebsite(null);
    setDeletingWebsite(null);
    setConnectingWebsite(null);
    setSettingsWebsite(null);
    setWebsitePlugins([]);
    setWebsiteThemes([]);
    setFormData({ name: '', url: '', description: '' });
    setConnectionData({ method: 'application_password', username: '', password: '', apiKey: '' });
    setError('');
    setSuccess('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'connected': return 'CONNECTED';
      case 'disconnected': return 'DISCONNECTED';
      case 'pending': return 'PENDING';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '40px 48px'
      }}
    >
      <Container size="xl" px="xl">
        <Stack spacing="xl">
          {(error || success) && (
            <Alert
              icon={error ? <IconAlertCircle size={16} /> : <IconCheck size={16} />}
              color={error ? 'red' : 'green'}
              variant="light"
              radius="xl"
              styles={{
                root: {
                  padding: '20px 24px',
                  marginBottom: '16px'
                }
              }}
            >
              {error || success}
            </Alert>
          )}

          <Flex justify="space-between" align="flex-end" mb="xl" mt="xl" pt="xl">
            <Box>
              <Title order={1} size="h1" weight={700} mb="xs" sx={{ fontSize: '2.5rem' }}>
                Websites
              </Title>
              <Text color="dimmed" size="lg" sx={{ fontSize: '1.125rem' }}>
                Manage your WordPress websites and connections
              </Text>
            </Box>
            <Button
              leftIcon={<IconPlus size={20} />}
              variant="gradient"
              gradient={{ from: 'blue.6', to: 'blue.8' }}
              onClick={() => setModalOpen(true)}
              radius="xl"
              size="lg"
              px="xl"
              styles={{
                root: {
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '160px',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.35)',
                  }
                }
              }}
            >
              Add Website
            </Button>
          </Flex>

          <Box sx={{ position: 'relative', padding: '0 8px' }}>
            <LoadingOverlay visible={loading} overlayBlur={2} />
            <Table
              striped
              highlightOnHover
              withBorder
              withColumnBorders
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                '& th': {
                  backgroundColor: '#f8fafc',
                  padding: '20px 28px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'left'
                },
                '& td': {
                  padding: '20px 28px',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '15px'
                },
                '& tbody tr:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            >
              <thead>
                <tr>
                  <th>Website</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th width={180}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => (
                  <tr key={website._id}>
                    <td>
                      <Box>
                        <Text weight={700} size="md" sx={{ fontSize: '16px', color: '#1f2937' }}>
                          {website.name}
                        </Text>
                        {website.description && (
                          <Text size="sm" color="dimmed" sx={{ marginTop: '4px' }}>
                            {website.description}
                          </Text>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Group spacing="xs">
                        <IconWorld size={16} color="#6b7280" />
                        <Text color="blue" size="md" sx={{ fontSize: '15px' }}>
                          {website.url}
                        </Text>
                      </Group>
                    </td>
                    <td>
                      <Badge
                        color={getStatusColor(website.status)}
                        variant="filled"
                        radius="xl"
                        size="lg"
                        styles={{
                          root: {
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }
                        }}
                      >
                        {getStatusLabel(website.status)}
                      </Badge>
                    </td>
                    <td>
                      {website.status === 'connected' ? (
                        <Stack spacing="xs">
                          <Text size="sm" color="dimmed">
                            WP {website.wpVersion}
                          </Text>
                          <Text size="sm" color="dimmed">
                            {website.plugins} plugins, {website.themes} themes
                          </Text>
                        </Stack>
                      ) : (
                        <Text size="sm" color="dimmed">
                          Not connected
                        </Text>
                      )}
                    </td>
                    <td>
                      <Group spacing="md">
                        {website.status !== 'connected' && (
                          <ActionIcon
                            color="green"
                            size="lg"
                            variant="subtle"
                            radius="xl"
                            onClick={() => openConnectModal(website)}
                            styles={{
                              root: {
                                '&:hover': {
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }
                            }}
                          >
                            <IconLink size={18} />
                          </ActionIcon>
                        )}
                        {website.status === 'connected' && (
                          <ActionIcon
                            color="blue"
                            size="lg"
                            variant="subtle"
                            radius="xl"
                            onClick={() => handleTestConnection(website)}
                            title="Test Connection & Refresh Data"
                            styles={{
                              root: {
                                '&:hover': {
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }
                            }}
                          >
                            <IconRefresh size={18} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          color="gray"
                          size="lg"
                          variant="subtle"
                          radius="xl"
                          onClick={() => openSettingsModal(website)}
                          disabled={website.status !== 'connected'}
                          styles={{
                            root: {
                              '&:hover': {
                                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              opacity: website.status !== 'connected' ? 0.5 : 1,
                              cursor: website.status !== 'connected' ? 'not-allowed' : 'pointer'
                            }
                          }}
                        >
                          <IconSettings size={18} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          size="lg"
                          variant="subtle"
                          radius="xl"
                          onClick={() => openDeleteModal(website)}
                          styles={{
                            root: {
                              '&:hover': {
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                transform: 'scale(1.1)'
                              }
                            }
                          }}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* Add Website Modal */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title="Add New Website"
            size="lg"
            radius="xl"
            styles={{
              content: {
                padding: '24px'
              },
              header: {
                padding: '24px 24px 0'
              },
              body: {
                padding: '24px'
              }
            }}
          >
            <form onSubmit={handleAddWebsite}>
              <Stack spacing="lg">
                <TextInput
                  label="Website Name"
                  placeholder="My WordPress Site"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  radius="md"
                  size="md"
                />
                <TextInput
                  label="Website URL"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                  radius="md"
                  size="md"
                />
                <Textarea
                  label="Description (Optional)"
                  placeholder="Brief description of this website"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  radius="md"
                  size="md"
                  minRows={3}
                />
                <Group position="right" mt="xl">
                  <Button
                    variant="light"
                    onClick={closeModal}
                    radius="xl"
                    size="md"
                    px="xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    gradient={{ from: 'blue.6', to: 'blue.8' }}
                    radius="xl"
                    size="md"
                    px="xl"
                  >
                    Add Website
                  </Button>
                </Group>
              </Stack>
            </form>
          </Modal>

          {/* Connect Website Modal */}
          <Modal
            opened={connectModalOpen}
            onClose={closeModal}
            title="Connect to WordPress"
            size="lg"
            radius="xl"
            styles={{
              content: {
                padding: '24px'
              },
              header: {
                padding: '24px 24px 0'
              },
              body: {
                padding: '24px'
              }
            }}
          >
            {connectingWebsite && (
              <form onSubmit={handleConnectWebsite}>
                <Stack spacing="lg">
                  <Box>
                    <Text weight={600} size="md" mb="xs">
                      Connecting to: {connectingWebsite.name}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {connectingWebsite.url}
                    </Text>
                  </Box>

                  <Select
                    label="Connection Method"
                    value={connectionData.method}
                    onChange={(value) => setConnectionData({...connectionData, method: value})}
                    data={connectionMethods}
                    radius="md"
                    size="md"
                  />

                  {connectionData.method === 'application_password' && (
                    <>
                      <Alert
                        icon={<IconShield size={16} />}
                        color="blue"
                        variant="light"
                        radius="md"
                      >
                        <Text size="sm">
                          <strong>Recommended:</strong> Application passwords are the most secure way to connect.
                          Create one in WordPress Admin → Users → Your Profile → Application Passwords.
                        </Text>
                      </Alert>

                      <TextInput
                        label="WordPress Username"
                        placeholder="admin"
                        value={connectionData.username}
                        onChange={(e) => setConnectionData({...connectionData, username: e.target.value})}
                        required
                        radius="md"
                        size="md"
                      />
                      <PasswordInput
                        label="Application Password"
                        placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                        value={connectionData.password}
                        onChange={(e) => setConnectionData({...connectionData, password: e.target.value})}
                        required
                        radius="md"
                        size="md"
                      />
                    </>
                  )}

                  <Group position="right" mt="xl">
                    <Button
                      variant="light"
                      onClick={closeModal}
                      radius="xl"
                      size="md"
                      px="xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      gradient={{ from: 'green.6', to: 'green.8' }}
                      radius="xl"
                      size="md"
                      px="xl"
                    >
                      Connect
                    </Button>
                  </Group>
                </Stack>
              </form>
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            opened={deleteModalOpen}
            onClose={closeModal}
            title="Delete Website"
            size="md"
            radius="xl"
            styles={{
              content: {
                padding: '24px'
              },
              header: {
                padding: '24px 24px 0'
              },
              body: {
                padding: '24px'
              }
            }}
          >
            {deletingWebsite && (
              <Stack spacing="md">
                <Text>
                  Are you sure you want to delete "{deletingWebsite.name}"? This action cannot be undone.
                </Text>
                <Group position="right" mt="md">
                  <Button variant="light" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={handleDeleteWebsite}>
                    Delete Website
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>

          {/* Website Settings Modal */}
          <Modal
            opened={settingsModalOpen}
            onClose={closeModal}
            title={settingsWebsite ? `Settings - ${settingsWebsite.name}` : 'Website Settings'}
            size="xl"
            radius="xl"
            styles={{
              content: {
                padding: '24px'
              },
              header: {
                padding: '24px 24px 0'
              },
              body: {
                padding: '24px'
              }
            }}
          >
            {settingsWebsite && (
              <Stack spacing="lg">
                {/* Tab Navigation */}
                <Group spacing="md">
                  <Button
                    variant={activeSettingsTab === 'plugins' ? 'filled' : 'light'}
                    onClick={() => setActiveSettingsTab('plugins')}
                    radius="xl"
                    size="sm"
                    styles={{
                      root: {
                        backgroundColor: activeSettingsTab === 'plugins'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(102, 126, 234, 0.1)',
                        color: activeSettingsTab === 'plugins' ? 'white' : '#667eea',
                        border: 'none',
                        '&:hover': {
                          backgroundColor: activeSettingsTab === 'plugins'
                            ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                            : 'rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  >
                    Plugins ({websitePlugins.length})
                  </Button>
                  <Button
                    variant={activeSettingsTab === 'themes' ? 'filled' : 'light'}
                    onClick={() => setActiveSettingsTab('themes')}
                    radius="xl"
                    size="sm"
                    styles={{
                      root: {
                        backgroundColor: activeSettingsTab === 'themes'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(102, 126, 234, 0.1)',
                        color: activeSettingsTab === 'themes' ? 'white' : '#667eea',
                        border: 'none',
                        '&:hover': {
                          backgroundColor: activeSettingsTab === 'themes'
                            ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                            : 'rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                  >
                    Themes ({websiteThemes.length})
                  </Button>
                </Group>

                <LoadingOverlay visible={settingsLoading} />

                {/* Plugins Tab */}
                {activeSettingsTab === 'plugins' && (
                  <Stack spacing="md">
                    <Title order={4} style={{ color: '#374151' }}>
                      Installed Plugins
                    </Title>

                    {websitePlugins.length === 0 ? (
                      <Text color="dimmed" ta="center" py="xl">
                        No plugins data available. Make sure the SparkleWP Connector plugin is installed and active.
                      </Text>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Stack spacing="xs">
                          {websitePlugins.map((plugin, index) => (
                            <Card key={index} padding="md" radius="md" withBorder>
                              <Group position="apart" align="flex-start">
                                <Stack spacing="xs" style={{ flex: 1 }}>
                                  <Group spacing="sm">
                                    <Text weight={600} size="sm" style={{ color: '#1f2937' }}>
                                      {plugin.name}
                                    </Text>
                                    <Badge
                                      color={plugin.active ? 'green' : 'gray'}
                                      variant="light"
                                      size="sm"
                                    >
                                      {plugin.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {plugin.network_active && (
                                      <Badge color="blue" variant="light" size="sm">
                                        Network Active
                                      </Badge>
                                    )}
                                    {plugin.update_available && (
                                      <Badge color="orange" variant="light" size="sm">
                                        Update Available
                                      </Badge>
                                    )}
                                  </Group>
                                  <Text size="xs" color="dimmed" lineClamp={2}>
                                    {plugin.description || 'No description available.'}
                                  </Text>
                                  <Group spacing="xs">
                                    <Text size="xs" color="dimmed">
                                      Version: <strong>{plugin.version}</strong>
                                      {plugin.update_available && plugin.latest_version && (
                                        <span style={{ color: '#f59e0b' }}>
                                          {' → '}<strong>{plugin.latest_version}</strong>
                                        </span>
                                      )}
                                    </Text>
                                    {plugin.author && (
                                      <Text size="xs" color="dimmed">
                                        • Author: {plugin.author}
                                      </Text>
                                    )}
                                  </Group>
                                </Stack>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </div>
                    )}
                  </Stack>
                )}

                {/* Themes Tab */}
                {activeSettingsTab === 'themes' && (
                  <Stack spacing="md">
                    <Title order={4} style={{ color: '#374151' }}>
                      Installed Themes
                    </Title>

                    {websiteThemes.length === 0 ? (
                      <Text color="dimmed" ta="center" py="xl">
                        No themes data available. Make sure the SparkleWP Connector plugin is installed and active.
                      </Text>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Stack spacing="xs">
                          {websiteThemes.map((theme, index) => (
                            <Card key={index} padding="md" radius="md" withBorder>
                              <Group position="apart" align="flex-start">
                                <Stack spacing="xs" style={{ flex: 1 }}>
                                  <Group spacing="sm">
                                    <Text weight={600} size="sm" style={{ color: '#1f2937' }}>
                                      {theme.name}
                                    </Text>
                                    <Badge
                                      color={theme.active ? 'green' : 'gray'}
                                      variant="light"
                                      size="sm"
                                    >
                                      {theme.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {theme.update_available && (
                                      <Badge color="orange" variant="light" size="sm">
                                        Update Available
                                      </Badge>
                                    )}
                                  </Group>
                                  <Text size="xs" color="dimmed" lineClamp={2}>
                                    {theme.description || 'No description available.'}
                                  </Text>
                                  <Group spacing="xs">
                                    <Text size="xs" color="dimmed">
                                      Version: <strong>{theme.version}</strong>
                                      {theme.update_available && theme.latest_version && (
                                        <span style={{ color: '#f59e0b' }}>
                                          {' → '}<strong>{theme.latest_version}</strong>
                                        </span>
                                      )}
                                    </Text>
                                    {theme.author && (
                                      <Text size="xs" color="dimmed">
                                        • Author: {theme.author}
                                      </Text>
                                    )}
                                  </Group>
                                </Stack>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </div>
                    )}
                  </Stack>
                )}

                <Group position="right" mt="xl">
                  <Button
                    variant="light"
                    onClick={closeModal}
                    radius="xl"
                    size="md"
                    px="xl"
                  >
                    Close
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>
        </Stack>
      </Container>
    </Box>
  );
}