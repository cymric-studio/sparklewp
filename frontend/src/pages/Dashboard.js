import React from 'react';
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
import { Card, Button } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();

  const statsData = [
    {
      title: 'Total Sites',
      value: '5',
      icon: IconWorld,
      color: 'gray-900',
      bgColor: 'bg-gray-900',
      shadowColor: 'shadow-black/20'
    },
    {
      title: 'Active Users',
      value: '12',
      icon: IconUsers,
      color: 'gray-800',
      bgColor: 'bg-gray-800',
      shadowColor: 'shadow-black/20'
    },
    {
      title: 'Updates Available',
      value: '3',
      icon: IconChartBar,
      color: 'gray-700',
      bgColor: 'bg-gray-700',
      shadowColor: 'shadow-black/20'
    },
    {
      title: 'Security Score',
      value: '98%',
      icon: IconShield,
      color: 'gray-600',
      bgColor: 'bg-gray-600',
      shadowColor: 'shadow-black/20'
    }
  ];

  const actions = [
    { label: 'Add New Site', icon: IconPlus },
    { label: 'Run Updates', icon: IconRefresh },
    { label: 'Security Scan', icon: IconScan },
    { label: 'View Reports', icon: IconReport }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-6 mt-8 pt-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Dashboard
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Overview of your SparkleWP management system
            </p>
          </div>

          {/* Welcome Card */}
          <Card
            shadow="xl"
            padding="lg"
            className="bg-gradient-primary border-0"
          >
            <div className="py-2">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, {user?.username || 'Admin'}! 👋
              </h2>
              <p className="text-base text-white opacity-90">
                Here's what's happening with your WordPress sites today.
              </p>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              const textColor = `text-${stat.color} dark:text-gray-100`;

              return (
                <Card
                  key={index}
                  shadow="lg"
                  padding="lg"
                  className="cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-elevation"
                >
                  <div className="flex flex-col space-y-6">
                    <div className="flex justify-between items-start">
                      <div className={`w-16 h-16 rounded-xl ${stat.bgColor} ${stat.shadowColor} shadow-lg flex items-center justify-center`}>
                        <Icon size={28} stroke={1.5} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 font-semibold uppercase tracking-wide">
                        {stat.title}
                      </p>
                      <p className={`text-4xl font-extrabold ${textColor} leading-tight`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card shadow="md" padding="xl" className="mt-8 mb-8">
            <div className="mt-8 pt-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    leftIcon={<Icon size={20} />}
                    variant="filled"
                    size="lg"
                    fullWidth
                    className="shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
