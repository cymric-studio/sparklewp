import React, { useEffect, useState, useRef } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconFileText,
  IconTrash,
  IconRefresh,
  IconEye,
  IconFilter,
  IconSettings,
  IconCode
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';
import {
  Button,
  Badge,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableData,
  Card
} from '../components/ui';

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
  const [requestBodyModalOpen, setRequestBodyModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRequestBody, setSelectedRequestBody] = useState(null);
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
      refreshInterval.current = setInterval(fetchLogs, 5000);
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

  const handleUpdateMaxSize = async (e) => {
    const size = parseInt(e.target.value);
    if (size < 100 || size > 10000) return;

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

  const openRequestBody = (log) => {
    setSelectedRequestBody(log);
    setRequestBodyModalOpen(true);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-8">
          {/* Alert Messages */}
          {(error || success) && (
            <div className={`flex items-start justify-between space-x-3 p-5 rounded-xl border ${
              error
                ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-start space-x-3">
                {error ? <IconAlertCircle size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" /> : <IconCheck size={20} className="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />}
                <p className={`text-sm ${error ? 'text-gray-800 dark:text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}>
                  {error || success}
                </p>
              </div>
              <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-end mb-8 mt-8 pt-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-1">Logging</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Monitor and debug API requests for troubleshooting</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                leftIcon={<IconTrash size={18} />}
                color="red"
                variant="outline"
                onClick={handleClearLogs}
                size="md"
              >
                Clear All
              </Button>
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <IconRefresh size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Settings Card */}
          <Card shadow="sm" padding="xl" withBorder>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logging Settings</h3>
              <IconSettings size={20} className="text-gray-500" />
            </div>

            <div className="flex flex-wrap gap-8">
              {/* Enable Logging Toggle */}
              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loggingEnabled}
                    onChange={(e) => handleToggleLogging(e.target.checked)}
                    className="w-11 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer transition-colors relative checked:bg-blue-600 before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Enable Request Logging</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Log all API requests for debugging</div>
                  </div>
                </label>
              </div>

              {/* Max Log Size */}
              <div className="flex flex-col space-y-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Maximum Log Entries</label>
                <input
                  type="number"
                  value={maxLogSize}
                  onChange={handleUpdateMaxSize}
                  min={100}
                  max={10000}
                  step={100}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">Limit stored log entries</div>
              </div>

              {/* Auto Refresh Toggle */}
              <div className="flex flex-col space-y-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => handleAutoRefreshToggle(e.target.checked)}
                    className="w-11 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer transition-colors relative checked:bg-blue-600 before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Auto Refresh</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Refresh every 5 seconds</div>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <Card shadow="sm" padding="lg" withBorder>
            <div className="flex items-center space-x-4 flex-wrap">
              <IconFilter size={18} className="text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">Filters:</span>

              <select
                value={filterMethod}
                onChange={(e) => handleFilterMethodChange(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 min-w-[130px]"
              >
                <option value="all">All Methods</option>
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => handleFilterStatusChange(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="success">Success (2xx)</option>
                <option value="error">Error (4xx, 5xx)</option>
              </select>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredLogs.length} of {logs.length} entries
              </span>
            </div>
          </Card>

          {/* Logs Table */}
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
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Method</TableHeader>
                    <TableHeader>Endpoint</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Response Time</TableHeader>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableData>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </TableData>
                      <TableData>
                        <Badge color={getMethodColor(log.method)} variant="filled" size="md">
                          {log.method}
                        </Badge>
                      </TableData>
                      <TableData>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                          {log.url}
                        </code>
                      </TableData>
                      <TableData>
                        <Badge color={getStatusColor(log.statusCode)} variant="filled" size="md">
                          {log.statusCode}
                        </Badge>
                      </TableData>
                      <TableData>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {log.responseTime}ms
                        </span>
                      </TableData>
                      <TableData>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {log.userId || 'Anonymous'}
                        </span>
                      </TableData>
                      <TableData>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openRequestBody(log)}
                            title="View Request Body"
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-all hover:scale-110"
                          >
                            <IconCode size={18} />
                          </button>
                          <button
                            onClick={() => openLogDetail(log)}
                            title="View Full Details"
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/20 transition-all hover:scale-110"
                          >
                            <IconEye size={18} />
                          </button>
                        </div>
                      </TableData>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Log Detail Modal */}
          <Modal
            opened={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            title={selectedLog ? `${selectedLog.method} ${selectedLog.url}` : 'Log Details'}
            size="xl"
          >
            {selectedLog && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status Code</div>
                    <Badge color={getStatusColor(selectedLog.statusCode)} size="lg">
                      {selectedLog.statusCode}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Response Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{selectedLog.responseTime}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">IP Address</div>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-gray-900 dark:text-gray-100">{selectedLog.ip}</code>
                  </div>
                  <div className="max-w-xs">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">User Agent</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 break-words">{selectedLog.userAgent}</div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Request Headers</div>
                  <div className="max-h-[200px] overflow-auto">
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                      {JSON.stringify(selectedLog.headers, null, 2)}
                    </pre>
                  </div>
                </div>

                {selectedLog.requestBody && (
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Request Body</div>
                    <div className="max-h-[200px] overflow-auto">
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {JSON.stringify(selectedLog.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.responseBody && (
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Response Body</div>
                    <div className="max-h-[200px] overflow-auto">
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {JSON.stringify(selectedLog.responseBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Request Body Modal */}
          <Modal
            opened={requestBodyModalOpen}
            onClose={() => setRequestBodyModalOpen(false)}
            title={selectedRequestBody ? `Request Body - ${selectedRequestBody.method} ${selectedRequestBody.url}` : 'Request Body'}
            size="lg"
          >
            {selectedRequestBody && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Method</div>
                    <Badge color={getMethodColor(selectedRequestBody.method)} size="lg">
                      {selectedRequestBody.method}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <Badge color={getStatusColor(selectedRequestBody.statusCode)} size="lg">
                      {selectedRequestBody.statusCode}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedRequestBody.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Endpoint</div>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-gray-100">
                    {selectedRequestBody.url}
                  </pre>
                </div>

                {selectedRequestBody.requestQuery && Object.keys(selectedRequestBody.requestQuery).length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Query Parameters</div>
                    <div className="max-h-[200px] overflow-auto">
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {JSON.stringify(selectedRequestBody.requestQuery, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRequestBody.requestBody && (
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Request Body</div>
                    <div className="max-h-[300px] overflow-auto">
                      <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {typeof selectedRequestBody.requestBody === 'string'
                          ? selectedRequestBody.requestBody
                          : JSON.stringify(selectedRequestBody.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {!selectedRequestBody.requestBody && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No request body data available
                    </p>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
