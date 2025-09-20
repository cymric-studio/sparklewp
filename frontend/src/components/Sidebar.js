import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const { Sider } = Layout;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sider breakpoint="lg" collapsedWidth="0">
      <div style={{ height: 32, margin: 16, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
        Sparkle
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="/users" icon={<UserOutlined />}>
          <Link to="/users">Users</Link>
        </Menu.Item>
      </Menu>

      {/* User info and logout at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: '16px',
        borderTop: '1px solid #434343',
        backgroundColor: '#001529'
      }}>
        <div style={{ color: '#fff', fontSize: '12px', marginBottom: '8px' }}>
          Welcome, {user?.username}
        </div>
        <Menu theme="dark" mode="inline" style={{ border: 'none' }}>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ margin: 0 }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </div>
    </Sider>
  );
} 