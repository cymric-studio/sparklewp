import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card } from 'antd';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (values) => {
    try {
      await axios.post('/api/users', values, { headers: { Authorization: `Bearer ${token}` } });
      message.success('User added');
      setModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add user');
    }
  };

  return (
    <Card>
      <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>Add User</Button>
      <Table dataSource={users} rowKey="_id" loading={loading} pagination={false} bordered>
        <Table.Column title="Username" dataIndex="username" key="username" />
        <Table.Column title="Email" dataIndex="email" key="email" />
        <Table.Column title="Role" dataIndex="role" key="role" />
      </Table>
      <Modal
        title="Add User"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> <Input /> </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}> <Input.Password /> </Form.Item>
          <Form.Item name="role" label="Role" initialValue="administrator" rules={[{ required: true }]}> <Select options={[{ value: 'administrator', label: 'Administrator' }]} disabled /> </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
} 