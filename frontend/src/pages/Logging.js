import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Title,
  Button,
  Table,
  Group,
  Stack,
  Badge,
  Alert,
  LoadingOverlay,
  Text,
  Box,
  Flex,
  Card,
  Switch,
  NumberInput,
  ActionIcon,
  Modal,
  Code,
  ScrollArea,
  Select
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconFileText,
  IconTrash,
  IconRefresh,
  IconEye,
  IconFilter,
  IconSettings
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

export default function Logging() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  const [maxLogSize, setMaxLogSize] = useState(1000);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('sparklewp-logging-autorefresh');
    return saved === 'true';
  });
  const [filterMethod, setFilterMethod] = useState(() => {
    return localStorage.getItem('sparklewp-logging-filter-method') || 'all';
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    return localStorage.getItem('sparklewp-logging-filter-status') || 'all';
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const refreshInterval = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMethod !== 'all') params.append('method', filterMethod);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const res = await api.get(`/api/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      setError('Failed to fetch logs');
      console.error('Fetch logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogSettings = async () => {
    try {
      const res = await api.get('/api/logs/settings/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoggingEnabled(res.data.enabled);
      setMaxLogSize(res.data.maxSize);
    } catch (err) {
      console.error('Failed to fetch log settings:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchLogSettings();
  }, []);

  const handleAutoRefreshToggle = (enabled) => {
    setAutoRefresh(enabled);
    localStorage.setItem('sparklewp-logging-autorefresh', enabled.toString());
  };

  const handleFilterMethodChange = (method) => {
    setFilterMethod(method);
    localStorage.setItem('sparklewp-logging-filter-method', method);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    localStorage.setItem('sparklewp-logging-filter-status', status);
  };

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  const handleToggleLogging = async (enabled) => {
    try {
      await api.post('/api/logs/settings', { enabled }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoggingEnabled(enabled);
      setSuccess(`Logging ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      setError('Failed to update logging settings');
      setLoggingEnabled(!enabled);
    }
  };

  const handleUpdateMaxSize = async (size) => {
    try {
      await api.post('/api/logs/settings', { maxSize: size }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaxLogSize(size);
      setSuccess(`Maximum log size updated to ${size} entries`);
    } catch (err) {
      setError('Failed to update log size limit');
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.delete('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([]);
      setSuccess('All logs cleared successfully');
    } catch (err) {
      setError('Failed to clear logs');
    }
  };

  const openLogDetail = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'orange';
    if (status >= 500) return 'red';
    return 'gray';
  };

  const getMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case 'get': return 'blue';
      case 'post': return 'green';
      case 'put': return 'yellow';
      case 'patch': return 'orange';
      case 'delete': return 'red';
      default: return 'gray';
    }
  };

  const filteredLogs = logs.filter(log => {
    const methodMatch = filterMethod === 'all' || log.method.toLowerCase() === filterMethod.toLowerCase();
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'success' && log.statusCode >= 200 && log.statusCode < 300) ||
      (filterStatus === 'error' && log.statusCode >= 400);

    return methodMatch && statusMatch;
  });

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
              onClose={() => { setError(''); setSuccess(''); }}
              withCloseButton
            >
              {error || success}
            </Alert>
          )}

          <Flex justify="space-between" align="flex-end" mb="xl" mt="xl" pt="xl">
            <Box>
              <Title order={1} size="h1" weight={700} mb="xs" sx={{ fontSize: '2.5rem' }}>
                Logging
              </Title>
              <Text color="dimmed" size="lg" sx={{ fontSize: '1.125rem' }}>
                Monitor and debug API requests for troubleshooting
              </Text>
            </Box>
            <Group spacing="md">
              <Button
                leftIcon={<IconTrash size={18} />}
                color="red"
                variant="outline"
                radius="xl"
                size="md"
                onClick={handleClearLogs}
              >
                Clear All
              </Button>
              <ActionIcon
                size="lg"
                variant="outline"
                radius="xl"
                onClick={fetchLogs}
                loading={loading}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Group>
          </Flex>

          {/* Settings Card */}
          <Card
            shadow="sm"
            padding="xl"
            radius="xl"
            withBorder
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Group position="apart" mb="md">
              <Text weight={600} size="lg">Logging Settings</Text>
              <IconSettings size={20} color="#6b7280" />
            </Group>

            <Group spacing="xl">
              <Switch
                label="Enable Request Logging"
                description="Log all API requests for debugging"
                checked={loggingEnabled}
                onChange={(event) => handleToggleLogging(event.currentTarget.checked)}
                size="md"
              />

              <NumberInput
                label="Maximum Log Entries"
                description="Limit the number of stored log entries"
                value={maxLogSize}
                onChange={handleUpdateMaxSize}
                min={100}
                max={10000}
                step={100}
                style={{ minWidth: '200px' }}
                size="md"
              />

              <Switch
                label="Auto Refresh"
                description="Automatically refresh logs every 5 seconds"
                checked={autoRefresh}
                onChange={(event) => handleAutoRefreshToggle(event.currentTarget.checked)}
                size="md"
              />
            </Group>
          </Card>

          {/* Filters */}
          <Card
            shadow="sm"
            padding="lg"
            radius="xl"
            withBorder
            sx={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Group spacing="md">
              <IconFilter size={18} color="#6b7280" />
              <Text weight={500}>Filters:</Text>
              <Select
                placeholder="All Methods"
                value={filterMethod}
                onChange={handleFilterMethodChange}
                data={[
                  { value: 'all', label: 'All Methods' },
                  { value: 'get', label: 'GET' },
                  { value: 'post', label: 'POST' },
                  { value: 'put', label: 'PUT' },
                  { value: 'patch', label: 'PATCH' },
                  { value: 'delete', label: 'DELETE' }
                ]}
                size="sm"
                style={{ minWidth: '130px' }}
              />
              <Select
                placeholder="All Status"
                value={filterStatus}
                onChange={handleFilterStatusChange}
                data={[
                  { value: 'all', label: 'All Status' },
                  { value: 'success', label: 'Success (2xx)' },
                  { value: 'error', label: 'Error (4xx, 5xx)' }
                ]}
                size="sm"
                style={{ minWidth: '130px' }}
              />
              <Text size="sm" color="dimmed">
                Showing {filteredLogs.length} of {logs.length} entries
              </Text>
            </Group>
          </Card>

          {/* Logs Table */}
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
                  <th>Time</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>User</th>
                  <th width={100}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <Text size="sm" weight={500}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </Text>
                    </td>
                    <td>
                      <Badge
                        color={getMethodColor(log.method)}
                        variant="filled"
                        size="md"
                        radius="md"
                      >
                        {log.method}
                      </Badge>
                    </td>
                    <td>
                      <Code
                        sx={{
                          backgroundColor: '#f8fafc',
                          padding: '4px 8px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        {log.url}
                      </Code>
                    </td>
                    <td>
                      <Badge
                        color={getStatusColor(log.statusCode)}
                        variant="filled"
                        size="md"
                        radius="md"
                      >
                        {log.statusCode}
                      </Badge>
                    </td>
                    <td>
                      <Text weight={500} size="sm">
                        {log.responseTime}ms
                      </Text>
                    </td>
                    <td>
                      <Text size="sm">
                        {log.userId || 'Anonymous'}
                      </Text>
                    </td>
                    <td>
                      <ActionIcon
                        color="blue"
                        size="lg"
                        variant="subtle"
                        radius="xl"
                        onClick={() => openLogDetail(log)}
                        styles={{
                          root: {
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              transform: 'scale(1.1)'
                            }
                          }
                        }}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* Log Detail Modal */}
          <Modal
            opened={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            title={selectedLog ? `${selectedLog.method} ${selectedLog.url}` : 'Log Details'}
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
            {selectedLog && (
              <Stack spacing="lg">
                <Group spacing="xl">
                  <Box>
                    <Text size="sm" color="dimmed" mb={4}>Status Code</Text>
                    <Badge color={getStatusColor(selectedLog.statusCode)} size="lg">
                      {selectedLog.statusCode}
                    </Badge>
                  </Box>
                  <Box>
                    <Text size="sm" color="dimmed" mb={4}>Response Time</Text>
                    <Text weight={600}>{selectedLog.responseTime}ms</Text>
                  </Box>
                  <Box>
                    <Text size="sm" color="dimmed" mb={4}>IP Address</Text>
                    <Code>{selectedLog.ip}</Code>
                  </Box>
                  <Box>
                    <Text size="sm" color="dimmed" mb={4}>User Agent</Text>
                    <Text size="sm" style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                      {selectedLog.userAgent}
                    </Text>
                  </Box>
                </Group>

                <Box>
                  <Text weight={600} mb="sm">Request Headers</Text>
                  <ScrollArea style={{ maxHeight: '200px' }}>
                    <Code block>
                      {JSON.stringify(selectedLog.headers, null, 2)}
                    </Code>
                  </ScrollArea>
                </Box>

                {selectedLog.requestBody && (
                  <Box>
                    <Text weight={600} mb="sm">Request Body</Text>
                    <ScrollArea style={{ maxHeight: '200px' }}>
                      <Code block>
                        {JSON.stringify(selectedLog.requestBody, null, 2)}
                      </Code>
                    </ScrollArea>
                  </Box>
                )}

                {selectedLog.responseBody && (
                  <Box>
                    <Text weight={600} mb="sm">Response Body</Text>
                    <ScrollArea style={{ maxHeight: '200px' }}>
                      <Code block>
                        {JSON.stringify(selectedLog.responseBody, null, 2)}
                      </Code>
                    </ScrollArea>
                  </Box>
                )}
              </Stack>
            )}
          </Modal>
        </Stack>
      </Container>
    </Box>
  );
}