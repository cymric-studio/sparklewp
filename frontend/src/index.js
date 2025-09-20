import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './routes/App';
import { AuthProvider } from './services/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './index.css';

function AppWithTheme() {
  const { colorScheme } = useTheme();

  return (
    <MantineProvider
      theme={{
        colorScheme,
        primaryColor: 'blue',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        headings: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        colors: {
          brand: [
            '#f0f4ff',
            '#d0ddff',
            '#a5bcff',
            '#7b9bff',
            '#5082ff',
            '#667eea',
            '#5a67d8',
            '#4c51bf',
            '#434190',
            '#3c366b'
          ]
        },
        primaryShade: { light: 5, dark: 8 },
        radius: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
        spacing: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 }
      }}
    >
      <Notifications />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>
); 