import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Input,
  PasswordInput,
  Textarea,
  Button,
  Badge,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableData
} from '../components/ui';

export default function Websites() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [deletingWebsite, setDeletingWebsite] = useState(null);
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
      await api.post('/api/websites', formData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Website added successfully. Please configure connection.');
      setModalOpen(false);
      setFormData({ name: '', url: '', description: '' });
      fetchWebsites();
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
      await api.post(`/api/websites/${connectingWebsite._id}/connect`, connectionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Website connected successfully!');
      setConnectModalOpen(false);
      setConnectingWebsite(null);
      setConnectionData({ method: 'application_password', username: '', password: '', apiKey: '' });
      fetchWebsites();
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
      fetchWebsites();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete website');
    }
  };

  const handleTestConnection = async (website) => {
    setError('');
    setSuccess('');

    try {
      await api.post(`/api/websites/${website._id}/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Connection test successful for ${website.name}. Site data refreshed.`);
      fetchWebsites();
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

  const openWebsiteSettings = (website) => {
    navigate(`/websites/${website._id}/settings`);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setConnectModalOpen(false);
    setEditingWebsite(null);
    setDeletingWebsite(null);
    setConnectingWebsite(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-8">
          {/* Alert Messages */}
          {(error || success) && (
            <div className={`flex items-start space-x-3 p-5 rounded-xl border ${
              error
                ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
            }`}>
              {error ? <IconAlertCircle size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" /> : <IconCheck size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />}
              <p className={`text-sm ${error ? 'text-gray-800 dark:text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                {error || success}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-end mb-8 mt-8 pt-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-1">Websites</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Manage your WordPress websites and connections</p>
            </div>
            <Button
              leftIcon={<IconPlus size={20} />}
              variant="gradient"
              color="blue"
              onClick={() => setModalOpen(true)}
              size="lg"
              className="px-8 min-w-[160px] shadow-blue-500/25 border border-white/10"
            >
              Add Website
            </Button>
          </div>

          {/* Websites Table */}
          <div className="relative p-2">
            {loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Website</TableHeader>
                    <TableHeader>URL</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Details</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {websites.map((website) => (
                    <TableRow key={website._id}>
                      <TableData>
                        <div>
                          <div className="font-bold text-base text-gray-900 dark:text-white">
                            {website.name}
                          </div>
                          {website.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {website.description}
                            </div>
                          )}
                        </div>
                      </TableData>
                      <TableData>
                        <div className="flex items-center space-x-2">
                          <IconWorld size={16} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {website.url}
                          </span>
                        </div>
                      </TableData>
                      <TableData>
                        <Badge
                          color={getStatusColor(website.status)}
                          variant="filled"
                          size="md"
                          className="uppercase tracking-wide"
                        >
                          {getStatusLabel(website.status)}
                        </Badge>
                      </TableData>
                      <TableData>
                        {website.status === 'connected' ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              WP {website.wpVersion}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {website.plugins} plugins, {website.themes} themes
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Not connected
                          </div>
                        )}
                      </TableData>
                      <TableData>
                        <div className="flex items-center space-x-3">
                          {website.status !== 'connected' && (
                            <button
                              onClick={() => openConnectModal(website)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-all hover:scale-110"
                            >
                              <IconLink size={18} />
                            </button>
                          )}
                          {website.status === 'connected' && (
                            <button
                              onClick={() => handleTestConnection(website)}
                              title="Test Connection & Refresh Data"
                              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/20 transition-all hover:scale-110"
                            >
                              <IconRefresh size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => openWebsiteSettings(website)}
                            disabled={website.status !== 'connected'}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IconSettings size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(website)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-all hover:scale-110"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </TableData>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Add Website Modal */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title="Add New Website"
            size="lg"
          >
            <form onSubmit={handleAddWebsite} className="space-y-6">
              <Input
                label="Website Name"
                placeholder="My WordPress Site"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input
                label="Website URL"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                required
              />
              <Textarea
                label="Description (Optional)"
                placeholder="Brief description of this website"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
              <div className="flex justify-end space-x-3 mt-8">
                <Button variant="light" color="gray" onClick={closeModal} size="md">Cancel</Button>
                <Button type="submit" variant="gradient" color="blue" size="md">Add Website</Button>
              </div>
            </form>
          </Modal>

          {/* Connect Website Modal */}
          <Modal
            opened={connectModalOpen}
            onClose={closeModal}
            title="Connect to WordPress"
            size="lg"
          >
            {connectingWebsite && (
              <form onSubmit={handleConnectWebsite} className="space-y-6">
                <div>
                  <div className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                    Connecting to: {connectingWebsite.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {connectingWebsite.url}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Connection Method</label>
                  <select
                    value={connectionData.method}
                    onChange={(e) => setConnectionData({...connectionData, method: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50 transition-all duration-200"
                  >
                    {connectionMethods.map((method) => (
                      <option key={method.value} value={method.value} disabled={method.disabled}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {connectionData.method === 'application_password' && (
                  <>
                    <div className="flex items-start space-x-3 p-4 bg-gray-100 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-700 rounded-lg">
                      <IconShield size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        <strong>Recommended:</strong> Application passwords are the most secure way to connect.
                        Create one in WordPress Admin → Users → Your Profile → Application Passwords.
                      </div>
                    </div>

                    <Input
                      label="WordPress Username"
                      placeholder="admin"
                      value={connectionData.username}
                      onChange={(e) => setConnectionData({...connectionData, username: e.target.value})}
                      required
                    />
                    <PasswordInput
                      label="Application Password"
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      value={connectionData.password}
                      onChange={(e) => setConnectionData({...connectionData, password: e.target.value})}
                      required
                    />
                  </>
                )}

                <div className="flex justify-end space-x-3 mt-8">
                  <Button variant="light" color="gray" onClick={closeModal} size="md">Cancel</Button>
                  <Button type="submit" variant="gradient" color="green" size="md">Connect</Button>
                </div>
              </form>
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            opened={deleteModalOpen}
            onClose={closeModal}
            title="Delete Website"
            size="md"
          >
            {deletingWebsite && (
              <div className="space-y-5">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete "{deletingWebsite.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="light" color="gray" onClick={closeModal}>Cancel</Button>
                  <Button color="red" onClick={handleDeleteWebsite}>Delete Website</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
