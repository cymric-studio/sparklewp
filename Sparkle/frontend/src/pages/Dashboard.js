import React from 'react';
import { Typography, Card } from 'antd';

export default function Dashboard() {
  return (
    <Card>
      <Typography.Title level={2}>Welcome to Sparkle Admin Dashboard!</Typography.Title>
      <Typography.Paragraph>
        Use the sidebar to manage users and view dashboard information.
      </Typography.Paragraph>
    </Card>
  );
} 