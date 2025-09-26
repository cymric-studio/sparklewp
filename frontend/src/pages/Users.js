import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Alert,
  LoadingOverlay,
  Text,
  Box,
  Flex
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

export default function Users() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff'
  });

  const isAdmin = user?.role === 'administrator';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/api/users', formData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('User added successfully');
      setModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAdmin && editingUser.role === 'administrator') {
      setError('Staff users cannot update admin users');
      return;
    }

    try {
      const updateData = {};

      // Only include role if user is not admin (since admin role field is hidden)
      if (editingUser.role !== 'administrator') {
        updateData.role = editingUser.role;
      }

      // Only include password if it's provided
      if (editingUser.password) {
        if (editingUser.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        updateData.password = editingUser.password;
      }

      // If no fields to update, show message
      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        return;
      }

      await api.put(`/api/users/${editingUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User updated successfully');
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    setError('');
    setSuccess('');

    if (!isAdmin) {
      setError('Only admin users can delete users');
      return;
    }

    try {
      await api.delete(`/api/users/${deletingUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User deleted successfully');
      setDeleteModalOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user, password: '' });
    setEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setEditingUser(null);
    setDeletingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'staff' });
    setError('');
    setSuccess('');
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
                Users
              </Title>
              <Text color="dimmed" size="lg" sx={{ fontSize: '1.125rem' }}>
                Manage user accounts and permissions
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
              Add User
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
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th width={140}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td>
                      <Text weight={700} size="md" sx={{ fontSize: '16px', color: '#1f2937' }}>
                        {userItem.username}
                      </Text>
                    </td>
                    <td>
                      <Text color="dimmed" size="md" sx={{ fontSize: '15px', color: '#6b7280' }}>
                        {userItem.email}
                      </Text>
                    </td>
                    <td>
                      <Badge
                        color={userItem.role === 'administrator' ? 'red' : 'blue'}
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
                        {userItem.role === 'administrator' ? 'ADMIN' : 'STAFF'}
                      </Badge>
                    </td>
                    <td>
                      <Group spacing="md">
                        <ActionIcon
                          color="blue"
                          size="lg"
                          variant="subtle"
                          radius="xl"
                          onClick={() => openEditModal(userItem)}
                          disabled={!isAdmin && userItem.role === 'administrator'}
                          styles={{
                            root: {
                              '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                transform: 'scale(1.1)'
                              }
                            }
                          }}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          size="lg"
                          variant="subtle"
                          radius="xl"
                          onClick={() => openDeleteModal(userItem)}
                          disabled={!isAdmin}
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

          {/* Add User Modal */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title="Add New User"
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
            <form onSubmit={handleAddUser}>
              <Stack spacing="lg">
                <TextInput
                  label="Username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  radius="md"
                  size="md"
                />
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  radius="md"
                  size="md"
                />
                <PasswordInput
                  label="Password"
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  radius="md"
                  size="md"
                />
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(value) => setFormData({...formData, role: value})}
                  data={[
                    { value: 'staff', label: 'Staff' },
                    ...(isAdmin ? [{ value: 'administrator', label: 'Administrator' }] : [])
                  ]}
                  radius="md"
                  size="md"
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
                    gradient={{ from: 'brand.5', to: 'brand.7' }}
                    radius="xl"
                    size="md"
                    px="xl"
                  >
                    Add User
                  </Button>
                </Group>
              </Stack>
            </form>
          </Modal>

          {/* Edit User Modal */}
          <Modal
            opened={editModalOpen}
            onClose={closeModal}
            title="Edit User"
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
            {editingUser && (
              <form onSubmit={handleEditUser}>
                <Stack spacing="md">
                  <TextInput
                    label="Username"
                    value={editingUser.username}
                    disabled
                    placeholder="Username cannot be changed"
                  />
                  <TextInput
                    label="Email"
                    value={editingUser.email}
                    disabled
                    placeholder="Email cannot be changed"
                  />
                  <PasswordInput
                    label="New Password (leave blank to keep current)"
                    placeholder="Enter new password (min 6 characters)"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  />
                  {editingUser.role !== 'administrator' && (
                    <Select
                      label="Role"
                      value={editingUser.role}
                      onChange={(value) => setEditingUser({...editingUser, role: value})}
                      disabled={!isAdmin}
                      data={[
                        { value: 'staff', label: 'Staff' },
                        ...(isAdmin ? [{ value: 'administrator', label: 'Administrator' }] : [])
                      ]}
                    />
                  )}
                  <Group position="right" mt="md">
                    <Button variant="light" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" gradient={{ from: 'brand.5', to: 'brand.7' }}>
                      Update User
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
            title="Delete User"
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
            {deletingUser && (
              <Stack spacing="md">
                <Text>
                  Are you sure you want to delete user "{deletingUser.username}"? This action cannot be undone.
                </Text>
                <Group position="right" mt="md">
                  <Button variant="light" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={handleDeleteUser}>
                    Delete User
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