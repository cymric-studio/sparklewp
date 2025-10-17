import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IconChevronLeft,
  IconPlugConnected,
  IconPalette,
  IconRefresh,
  IconExternalLink,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconDownload,
  IconTrash,
  IconSettings,
  IconInfoCircle
} from '@tabler/icons-react';
import { Button, Badge } from '../components/ui';
import api from '../services/api';

export default function WebsiteSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [websitePlugins, setWebsitePlugins] = useState([]);
  const [websiteThemes, setWebsiteThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('plugins');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWebsiteDetails();
  }, [id]);

  const fetchWebsiteDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/api/websites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const websiteData = res.data;
      setWebsite(websiteData);

      if (websiteData.detailedPlugins) {
        setWebsitePlugins(websiteData.detailedPlugins);
      } else {
        setWebsitePlugins([]);
      }

      if (websiteData.detailedThemes) {
        setWebsiteThemes(websiteData.detailedThemes);
      } else {
        setWebsiteThemes([]);
      }

    } catch (err) {
      console.error('Error fetching website details:', err);
      setError(err.response?.data?.message || 'Failed to fetch website details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/api/websites/${id}/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Website data refreshed successfully');
      // Refresh the page data
      await fetchWebsiteDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh website data');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'yellow';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getUpdateStats = (items) => {
    const total = items.length;
    const withUpdates = items.filter(item => item.update_available).length;
    const active = items.filter(item => item.active).length;

    return { total, withUpdates, active };
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-3 p-5 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <IconAlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Website Not Found</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                The website you're looking for doesn't exist or you don't have access to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pluginStats = getUpdateStats(websitePlugins);
  const themeStats = getUpdateStats(websiteThemes);

  return (
    <div className="min-h-screen bg-gradient-primary py-8 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white/15 backdrop-blur-glass border border-white/20 rounded-2xl p-6 shadow-glass">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => navigate('/websites')}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:scale-105"
                >
                  <IconChevronLeft size={24} />
                </button>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-4xl font-bold text-white">
                      {website.name}
                    </h1>
                    <Badge
                      color={getStatusColor(website.status)}
                      variant="filled"
                      size="lg"
                      className="capitalize"
                    >
                      {website.status}
                    </Badge>
                  </div>

                  <nav className="flex items-center space-x-2 text-white/80">
                    <button
                      onClick={() => navigate('/websites')}
                      className="hover:text-white transition-colors"
                    >
                      Websites
                    </button>
                    <span className="text-white/60">›</span>
                    <span className="text-white">{website.name}</span>
                  </nav>

                  <p className="text-white/90 text-base">
                    {website.url}
                  </p>
                </div>
              </div>

              <Button
                leftIcon={<IconRefresh size={18} />}
                variant="filled"
                size="lg"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white text-gray-900 hover:bg-white/90 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="flex items-start space-x-3 p-5 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <IconAlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <IconX size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-3 p-5 rounded-xl border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <IconCheck size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-800 dark:text-green-200 mb-1">Success</p>
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <IconX size={18} />
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plugins Stat */}
            <div className="bg-white/98 backdrop-blur-glass border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                    PLUGINS
                  </p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-none my-2">
                    {pluginStats.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pluginStats.active} active • {pluginStats.withUpdates} updates
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <IconPlugConnected size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Themes Stat */}
            <div className="bg-white/98 backdrop-blur-glass border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                    THEMES
                  </p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-none my-2">
                    {themeStats.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {themeStats.active} active • {themeStats.withUpdates} updates
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <IconPalette size={28} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* WordPress Stat */}
            <div className="bg-white/98 backdrop-blur-glass border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                    WORDPRESS
                  </p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-none my-2">
                    {website.wpVersion || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last sync: {website.lastSync ? new Date(website.lastSync).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <IconInfoCircle size={28} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-md">
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => {
                  console.log('Switching to plugins tab');
                  setActiveTab('plugins');
                }}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'plugins'
                    ? 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                } hover:-translate-y-0.5`}
              >
                <IconPlugConnected size={20} />
                <span>Plugins</span>
                <Badge
                  size="sm"
                  variant={activeTab === 'plugins' ? 'light' : 'filled'}
                  color="blue"
                >
                  {pluginStats.total}
                </Badge>
              </button>

              <button
                onClick={() => {
                  console.log('Switching to themes tab');
                  setActiveTab('themes');
                }}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'themes'
                    ? 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                } hover:-translate-y-0.5`}
              >
                <IconPalette size={20} />
                <span>Themes</span>
                <Badge
                  size="sm"
                  variant={activeTab === 'themes' ? 'light' : 'filled'}
                  color="violet"
                >
                  {themeStats.total}
                </Badge>
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/98 backdrop-blur-glass border border-white/30 rounded-2xl p-8 shadow-xl">
            {/* Plugins Content */}
            {activeTab === 'plugins' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Installed Plugins
                  </h2>
                  {pluginStats.withUpdates > 0 && (
                    <Button
                      variant="gradient"
                      size="md"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {pluginStats.withUpdates} Updates Available
                    </Button>
                  )}
                </div>

                {websitePlugins.length === 0 ? (
                  <div className="flex items-start space-x-3 p-6 rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <IconInfoCircle size={24} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 dark:text-blue-200">
                      No plugins data available. Make sure the SparkleWP Connector plugin is installed and active on your WordPress site.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {websitePlugins.map((plugin, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3 flex-wrap gap-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {plugin.name}
                              </h3>
                              <Badge
                                color={plugin.active ? 'green' : 'gray'}
                                variant={plugin.active ? 'filled' : 'light'}
                                size="md"
                              >
                                {plugin.active ? 'Active' : 'Inactive'}
                              </Badge>
                              {plugin.network_active && (
                                <Badge color="blue" variant="light" size="md">
                                  Network Active
                                </Badge>
                              )}
                              {plugin.update_available && (
                                <Badge
                                  size="md"
                                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                >
                                  Update Available
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                              {plugin.description || 'No description available.'}
                            </p>

                            <div className="flex items-center space-x-6">
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Version: <span className="font-bold text-gray-900 dark:text-gray-100">{plugin.version}</span>
                                {plugin.update_available && plugin.latest_version && (
                                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                    {' → '}<span className="font-bold">{plugin.latest_version}</span>
                                  </span>
                                )}
                              </p>
                              {plugin.author && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  Author: <span className="font-bold text-gray-900 dark:text-gray-100">{plugin.author}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {plugin.update_available && (
                              <button
                                title="Update plugin"
                                className="w-11 h-11 flex items-center justify-center rounded-xl text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all hover:scale-110"
                              >
                                <IconDownload size={20} />
                              </button>
                            )}
                            <button
                              title="Plugin settings"
                              className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
                            >
                              <IconSettings size={20} />
                            </button>
                            {!plugin.active && (
                              <button
                                title="Delete plugin"
                                className="w-11 h-11 flex items-center justify-center rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-110"
                              >
                                <IconTrash size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Themes Content */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Installed Themes
                  </h2>
                  {themeStats.withUpdates > 0 && (
                    <Button
                      variant="gradient"
                      size="md"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {themeStats.withUpdates} Updates Available
                    </Button>
                  )}
                </div>

                {websiteThemes.length === 0 ? (
                  <div className="flex items-start space-x-3 p-6 rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <IconInfoCircle size={24} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 dark:text-blue-200">
                      No themes data available. Make sure the SparkleWP Connector plugin is installed and active on your WordPress site.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {websiteThemes.map((theme, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-3 flex-wrap gap-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {theme.name}
                              </h3>
                              <Badge
                                color={theme.active ? 'green' : 'gray'}
                                variant={theme.active ? 'filled' : 'light'}
                                size="md"
                              >
                                {theme.active ? 'Active' : 'Inactive'}
                              </Badge>
                              {theme.update_available && (
                                <Badge
                                  size="md"
                                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                >
                                  Update Available
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                              {theme.description || 'No description available.'}
                            </p>

                            <div className="flex items-center space-x-6">
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Version: <span className="font-bold text-gray-900 dark:text-gray-100">{theme.version}</span>
                                {theme.update_available && theme.latest_version && (
                                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                    {' → '}<span className="font-bold">{theme.latest_version}</span>
                                  </span>
                                )}
                              </p>
                              {theme.author && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  Author: <span className="font-bold text-gray-900 dark:text-gray-100">{theme.author}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {theme.update_available && (
                              <button
                                title="Update theme"
                                className="w-11 h-11 flex items-center justify-center rounded-xl text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all hover:scale-110"
                              >
                                <IconDownload size={20} />
                              </button>
                            )}
                            <button
                              title="Theme settings"
                              className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
                            >
                              <IconSettings size={20} />
                            </button>
                            {!theme.active && (
                              <button
                                title="Delete theme"
                                className="w-11 h-11 flex items-center justify-center rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-110"
                              >
                                <IconTrash size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
