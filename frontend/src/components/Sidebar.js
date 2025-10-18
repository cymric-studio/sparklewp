import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconUsers,
  IconWorld,
  IconFileText,
  IconLogout,
  IconSun,
  IconMoonStars
} from '@tabler/icons-react';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { colorScheme, toggleColorScheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconDashboard },
    { path: '/websites', label: 'Websites', icon: IconWorld },
    { path: '/users', label: 'Users', icon: IconUsers },
    { path: '/logging', label: 'Logging', icon: IconFileText }
  ];

  return (
    <div className="fixed left-0 top-0 w-[250px] h-screen bg-gradient-sidebar flex flex-col p-4 z-[1000] overflow-hidden">
      {/* Logo Section */}
      <div className="p-4 mb-4 text-center border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">
          SparkleWP
        </h2>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 no-underline
                  max-w-[218px] overflow-hidden
                  border-l-3
                  ${isActive
                    ? 'bg-white text-gray-900 border-l-white'
                    : 'bg-transparent text-white/80 border-l-transparent hover:bg-white/10'
                  }
                `}
              >
                <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-gray-900' : ''}`} />
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <div className="h-px bg-white/10 mb-4" />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/70">Theme</span>
          <button
            onClick={toggleColorScheme}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
          </button>
        </div>

        {/* User Greeting */}
        <p className="text-sm text-white/70 mb-4">
          Welcome back, {user?.username || 'Admin'}!
        </p>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border-none font-medium text-sm"
        >
          <IconLogout size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
