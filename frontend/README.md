# SparkleWP Frontend

React-based frontend application for managing WordPress sites with Tailwind CSS.

## Tech Stack

- **React 18.2.0** - Modern React with hooks and functional components
- **React Router v6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Headless UI 2.2** - Accessible, unstyled UI components
- **Axios** - HTTP client for API communication
- **Tabler Icons** - Icon library

## Features

### UI Framework
- **Tailwind CSS**: Custom configuration with brand colors and themes
- **Dark Mode**: Full dark mode support with smooth transitions
- **Responsive Design**: Mobile-first approach with breakpoints
- **Glass-morphism**: Backdrop blur and transparency effects
- **Custom Components**: Reusable component library

### Component Library

Located in `src/components/ui/`:

- **Button** - Multiple variants (filled, gradient, outline, subtle, light)
- **Card** - Container with padding, shadow, and glass effects
- **Input** - Form inputs with labels, errors, and icons
- **PasswordInput** - Password field with show/hide toggle
- **Modal** - Dialog component with backdrop and animations
- **Badge** - Status indicators with color variants
- **Table** - Data table components with sorting

### Pages

- **Login** - Authentication with JWT
- **Dashboard** - Overview statistics and quick actions
- **Users** - User management (CRUD operations)
- **Websites** - WordPress site management
- **WebsiteSettings** - Detailed plugin/theme management
- **Logging** - Request and error log viewer

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Table.jsx
│   │   │   └── index.js
│   │   └── Sidebar.js       # Navigation sidebar
│   ├── pages/               # Page components
│   │   ├── Dashboard.js
│   │   ├── Users.js
│   │   ├── Websites.js
│   │   ├── WebsiteSettings.js
│   │   ├── Logging.js
│   │   └── Login.js
│   ├── routes/
│   │   └── App.js           # Main app with routing
│   ├── services/
│   │   ├── api.js           # Axios instance
│   │   └── AuthContext.js   # Authentication context
│   ├── contexts/
│   │   └── ThemeContext.js  # Dark mode context
│   ├── index.js             # App entry point
│   └── index.css            # Tailwind imports
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── nginx.conf               # Nginx config for Docker
├── Dockerfile               # Production build
└── package.json
```

## Development

### Installation

```bash
npm install
```

### Running Dev Server

```bash
npm start
```

Runs on `http://localhost:3000` with hot reload.

### Building for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Tailwind Configuration

### Custom Colors

Brand colors defined in `tailwind.config.js`:

```javascript
colors: {
  brand: {
    50: '#f0f4ff',
    100: '#d0ddff',
    // ... 500 is primary: #667eea
    900: '#3c366b',
  }
}
```

### Custom Gradients

```javascript
backgroundImage: {
  'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-sidebar': 'linear-gradient(180deg, #2c2e33 0%, #1a1b1e 100%)',
}
```

### Glass Effects

```javascript
boxShadow: {
  'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  'elevation': '0 20px 40px rgba(0, 0, 0, 0.15)',
}
backdropBlur: {
  'glass': '10px',
}
```

## Dark Mode

Dark mode is implemented using:
- Tailwind's `dark:` variant
- ThemeContext for state management
- localStorage for persistence
- Class-based strategy on `<html>` element

Toggle dark mode in the sidebar.

## API Integration

### API Client

Located in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});
```

### Environment Variables

Create `.env.local` for development:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production Docker builds, Nginx proxies `/api` to backend.

## Docker Deployment

### Dockerfile

Multi-stage build:
1. **Build stage** - Installs dependencies and builds React app
2. **Production stage** - Nginx serves static files

### Nginx Configuration

`nginx.conf` includes:
- Serve static React build from `/usr/share/nginx/html`
- Proxy `/api/*` requests to backend service
- SPA routing support (all routes → index.html)

### Building Docker Image

```bash
docker build -t sparklewp-frontend .
```

### Running Container

```bash
docker run -p 80:80 sparklewp-frontend
```

## Component Usage Examples

### Button

```jsx
import { Button } from '../components/ui';

<Button variant="gradient" color="brand" size="lg">
  Click Me
</Button>
```

### Card

```jsx
import { Card } from '../components/ui';

<Card shadow="xl" padding="lg" glass>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

### Modal

```jsx
import { Modal } from '../components/ui';

<Modal
  opened={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

### Input

```jsx
import { Input, PasswordInput } from '../components/ui';

<Input
  label="Username"
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>

<PasswordInput
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

## Styling Guidelines

### Using Tailwind

Use utility classes directly in JSX:

```jsx
<div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### Dark Mode

Add `dark:` variant for dark mode styles:

```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Responsive Design

Use responsive breakpoints:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

## Dependencies

### Core
- `react` - ^18.2.0
- `react-dom` - ^18.2.0
- `react-router-dom` - ^6.22.3

### UI & Styling
- `tailwindcss` - ^3.4.18
- `@headlessui/react` - ^2.2.9
- `@tabler/icons-react` - ^3.35.0

### API & Data
- `axios` - ^1.6.7

### Build Tools
- `react-scripts` - ^5.0.1
- `postcss` - ^8.5.6
- `autoprefixer` - ^10.4.21

## Scripts

```bash
# Development
npm start              # Start dev server (port 3000)

# Production
npm run build          # Create production build

# Testing (if configured)
npm test               # Run tests
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance

### Production Build Optimizations

- Code splitting
- Tree shaking
- Minification
- Gzip compression (via Nginx)
- Asset caching

### Bundle Size

After gzip:
- Main JS: ~100 KB
- Main CSS: ~7 KB

## Troubleshooting

### Build Errors

**Issue**: Tailwind classes not working

**Solution**: Ensure Tailwind is configured in `tailwind.config.js` and imported in `index.css`

**Issue**: Dark mode not working

**Solution**: Check ThemeContext is wrapping the app and HTML element has `dark` class

### Development Issues

**Issue**: Hot reload not working

**Solution**: Restart dev server

**Issue**: API calls failing

**Solution**: Check backend is running on port 5000 and CORS is configured

## Contributing

When contributing to frontend:

1. Follow existing component patterns
2. Use Tailwind utilities (avoid custom CSS)
3. Maintain dark mode support
4. Test responsive design
5. Update this README if adding new features

## License

MIT License - See main project LICENSE file
