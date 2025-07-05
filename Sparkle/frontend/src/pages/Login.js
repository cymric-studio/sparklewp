import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useAuth } from '../services/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    navigate('/');
    return null;
  }

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Call backend login endpoint
      const res = await axios.post('/api/auth/login', values);
      // Save token and user info in context/localStorage
      login(res.data.token, res.data.user);
      message.success('Login successful!');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Center the login form on the page
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Login" style={{ width: 350 }}>
        {/* Ant Design Form for login */}
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input your username!' }]}> <Input /> </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}> <Input.Password /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 