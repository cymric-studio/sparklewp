import React, { useEffect, useState } from 'react';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';
import {
  Input,
  PasswordInput,
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

      // Only include role if user is not admin
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

  const openEditModal = (userItem) => {
    setEditingUser({ ...userItem, password: '' });
    setEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (userItem) => {
    setDeletingUser(userItem);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-8">
          {/* Alert Messages */}
          {(error || success) && (
            <div className={`flex items-start space-x-3 p-5 rounded-xl border ${
              error
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              {error ? <IconAlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" /> : <IconCheck size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />}
              <p className={`text-sm ${error ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                {error || success}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-end mb-8 mt-8 pt-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-1">Users</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Manage user accounts and permissions</p>
            </div>
            <Button
              leftIcon={<IconPlus size={20} />}
              variant="gradient"
              color="blue"
              onClick={() => setModalOpen(true)}
              size="lg"
              className="px-8 min-w-[160px] shadow-blue-500/25 border border-white/10"
            >
              Add User
            </Button>
          </div>

          {/* Users Table */}
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
                    <TableHeader>Username</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem._id}>
                      <TableData>
                        <span className="font-bold text-base text-gray-900 dark:text-white">
                          {userItem.username}
                        </span>
                      </TableData>
                      <TableData>
                        <span className="text-gray-600 dark:text-gray-400">
                          {userItem.email}
                        </span>
                      </TableData>
                      <TableData>
                        <Badge
                          color={userItem.role === 'administrator' ? 'red' : 'blue'}
                          variant="filled"
                          size="md"
                          className="uppercase tracking-wide"
                        >
                          {userItem.role === 'administrator' ? 'ADMIN' : 'STAFF'}
                        </Badge>
                      </TableData>
                      <TableData>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(userItem)}
                            disabled={!isAdmin && userItem.role === 'administrator'}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(userItem)}
                            disabled={!isAdmin}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Add User Modal */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title="Add New User"
            size="md"
          >
            <form onSubmit={handleAddUser} className="space-y-6">
              <Input
                label="Username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50 transition-all duration-200"
                >
                  <option value="staff">Staff</option>
                  {isAdmin && <option value="administrator">Administrator</option>}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <Button variant="light" color="gray" onClick={closeModal} size="md">Cancel</Button>
                <Button type="submit" variant="gradient" color="brand" size="md">Add User</Button>
              </div>
            </form>
          </Modal>

          {/* Edit User Modal */}
          <Modal
            opened={editModalOpen}
            onClose={closeModal}
            title="Edit User"
            size="md"
          >
            {editingUser && (
              <form onSubmit={handleEditUser} className="space-y-5">
                <Input
                  label="Username"
                  value={editingUser.username}
                  disabled
                  className="opacity-60"
                />
                <Input
                  label="Email"
                  value={editingUser.email}
                  disabled
                  className="opacity-60"
                />
                <PasswordInput
                  label="New Password (leave blank to keep current)"
                  placeholder="Enter new password (min 6 characters)"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                />
                {editingUser.role !== 'administrator' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      disabled={!isAdmin}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50 transition-all duration-200 disabled:opacity-60"
                    >
                      <option value="staff">Staff</option>
                      {isAdmin && <option value="administrator">Administrator</option>}
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="light" color="gray" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" variant="gradient" color="brand">Update User</Button>
                </div>
              </form>
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            opened={deleteModalOpen}
            onClose={closeModal}
            title="Delete User"
            size="md"
          >
            {deletingUser && (
              <div className="space-y-5">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete user "{deletingUser.username}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="light" color="gray" onClick={closeModal}>Cancel</Button>
                  <Button color="red" onClick={handleDeleteUser}>Delete User</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
