import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

export default function Sidebar() {
  const location = useLocation();
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
    </Sider>
  );
} 