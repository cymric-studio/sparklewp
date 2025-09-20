import React from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Button,
  Box,
  ThemeIcon,
  Flex
} from '@mantine/core';
import {
  IconWorld,
  IconUsers,
  IconChartBar,
  IconShield,
  IconPlus,
  IconRefresh,
  IconScan,
  IconReport
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const statsData = [
    {
      title: 'Total Sites',
      value: '5',
      icon: IconWorld,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '12',
      icon: IconUsers,
      color: 'green'
    },
    {
      title: 'Updates Available',
      value: '3',
      icon: IconChartBar,
      color: 'orange'
    },
    {
      title: 'Security Score',
      value: '98%',
      icon: IconShield,
      color: 'teal'
    }
  ];

  const actions = [
    { label: 'Add New Site', icon: IconPlus },
    { label: 'Run Updates', icon: IconRefresh },
    { label: 'Security Scan', icon: IconScan },
    { label: 'View Reports', icon: IconReport }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '32px'
      }}
    >
      <Container size="xl">
        <Stack spacing="xl">
          <Box mb="lg" mt="xl" pt="md">
            <Title order={1} size="h1" weight={700} mb="md">
              Dashboard
            </Title>
            <Text color="dimmed" size="lg">
              Overview of your SparkleWP management system
            </Text>
          </Box>

          <Card
            shadow="xl"
            padding="2.5rem"
            radius="lg"
            style={{
              background: '#2C5F7C',
              border: 0
            }}
          >
            <Stack spacing="md" style={{ padding: '0.5rem 0' }}>
              <Text size="xl" weight={700} color="white">
                Welcome back, {user?.username || 'Admin'}! 👋
              </Text>
              <Text size="md" color="white" style={{ opacity: 0.9 }}>
                Here's what's happening with your WordPress sites today.
              </Text>
            </Stack>
          </Card>

          <SimpleGrid
            cols={4}
            spacing="xl"
            breakpoints={[
              { maxWidth: 'md', cols: 2 },
              { maxWidth: 'sm', cols: 1 }
            ]}
          >
            {statsData.map((stat, index) => (
              <Card
                key={index}
                shadow="lg"
                padding="2rem"
                radius="xl"
                withBorder={false}
                styles={{
                  root: {
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    }
                  }
                }}
              >
                <Stack spacing="lg" align="stretch">
                  <Group position="apart" align="flex-start">
                    <ThemeIcon
                      size={64}
                      radius="xl"
                      variant="filled"
                      color={stat.color === 'blue' ? '#3B82C7' :
                             stat.color === 'green' ? '#059669' :
                             stat.color === 'orange' ? '#D97706' : '#0891B2'}
                      styles={{
                        root: {
                          boxShadow: `0 4px 12px ${
                            stat.color === 'blue' ? 'rgba(59, 130, 199, 0.3)' :
                            stat.color === 'green' ? 'rgba(5, 150, 105, 0.3)' :
                            stat.color === 'orange' ? 'rgba(217, 119, 6, 0.3)' : 'rgba(8, 145, 178, 0.3)'
                          }`
                        }
                      }}
                    >
                      <stat.icon size={28} stroke={1.5} />
                    </ThemeIcon>
                  </Group>

                  <Box>
                    <Text
                      color="dimmed"
                      size="sm"
                      mb="xs"
                      weight={600}
                      transform="uppercase"
                      style={{ letterSpacing: '0.5px' }}
                    >
                      {stat.title}
                    </Text>
                    <Text
                      size={32}
                      weight={800}
                      style={{
                        color: stat.color === 'blue' ? '#3B82C7' :
                               stat.color === 'green' ? '#059669' :
                               stat.color === 'orange' ? '#D97706' : '#0891B2',
                        lineHeight: 1.2
                      }}
                    >
                      {stat.value}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>

          <Card shadow="md" padding="xl" radius="xl" withBorder={false} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem' }}>
              <Title order={3} size="h3" weight={600} mb="xl">
                Quick Actions
              </Title>
            </div>
            <SimpleGrid cols={4} spacing="md" breakpoints={[
              { maxWidth: 'md', cols: 2 },
              { maxWidth: 'sm', cols: 1 }
            ]}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  leftIcon={<action.icon size={20} />}
                  variant="filled"
                  color="#2C5F7C"
                  radius="xl"
                  size="lg"
                  px="xl"
                  fullWidth
                  styles={{
                    root: {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      }
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </SimpleGrid>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
} 