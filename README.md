# SparkleWP

A modern WordPress management application with a beautiful, responsive interface for managing multiple WordPress sites from a single dashboard.

## Features

### 🔐 Authentication System
- **Modern Login Interface**: Beautiful gradient design with form validation
- **Secure JWT Authentication**: Token-based authentication with rate limiting
- **Password Visibility Toggle**: User-friendly password input with show/hide functionality
- **Auto-logout**: Automatic session management

### 🌐 WordPress Site Management
- **Multi-Site Dashboard**: Manage multiple WordPress websites from a single interface
- **Real-time Connection Testing**: Test WordPress site connectivity with detailed error reporting
- **Multiple Authentication Methods**: Support for Application Passwords, JWT, OAuth, and custom tokens
- **Site Statistics**: View plugin count, theme count, post count, and WordPress version for each site
- **Auto-Discovery**: Intelligent WordPress site detection and validation

### 🔌 WordPress Plugin Integration
- **SparkleWP Connector Plugin**: Custom WordPress plugin for enhanced integration
- **Automatic Application Password Generation**: Plugin auto-generates secure application passwords
- **One-Click Setup**: Install plugin and instantly get connection credentials
- **Advanced Site Information**: Comprehensive site data including plugins, themes, and server info
- **Copy-to-Clipboard**: Easy credential copying with visual feedback
- **Debug Information**: Built-in troubleshooting tools and WordPress compatibility checking

### 📊 Dashboard Interface
- **Responsive Sidebar**: Fixed navigation with gradient styling and active state indicators
- **Statistics Overview**: Quick stats cards showing site metrics
- **Welcome Messages**: Personalized user greetings
- **Quick Actions**: Easy access to common management tasks
- **Real-time Updates**: Live status indicators for connected sites

### 👥 User Management
- **Role-Based Access**: Administrator and user role management
- **User Profile Management**: Edit user details, roles, and permissions
- **User Status Control**: Enable/disable user accounts
- **Activity Tracking**: Monitor user login activity and account status

### 📝 Comprehensive Logging
- **Request Monitoring**: Track all API requests with detailed information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Metrics**: Response times and request statistics
- **User Activity Logs**: Track user actions and authentication events
- **Filterable Logs**: Search and filter logs by date, level, user, and endpoint
- **Real-time Log Viewing**: Live log updates with automatic refresh

### 🛡️ Security Features
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **Secure Password Hashing**: bcrypt for password protection
- **JWT Token Security**: Signed tokens with expiration
- **WordPress Security Integration**: Secure application password management

### 🎨 Modern UI/UX
- **No External Dependencies**: Uses reliable inline CSS for consistent styling
- **Mobile Responsive**: Works perfectly on all device sizes
- **Beautiful Gradients**: Modern color schemes and visual effects
- **Interactive Elements**: Hover effects and smooth transitions
- **Data Tables**: Sortable and searchable tables for managing data
- **Modal Dialogs**: Professional popup interfaces for actions
- **Loading States**: Visual feedback for all async operations

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for SPA navigation
- **Axios**: HTTP client for API communication
- **Custom Styling**: Inline CSS for reliable, dependency-free styling

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework with security middleware
- **MongoDB**: Database with in-memory option for development
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Rate Limiting**: Express rate limiter for security

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cymric-studio/sparklewp.git
   cd sparklewp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start the backend server** (from `/backend`)
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start the frontend application** (from `/frontend`)
   ```bash
   npm start
   ```
   Application runs on `http://localhost:3000`

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## WordPress Integration

### Installing the SparkleWP Connector Plugin

1. **Download the plugin** from the `wordpress-plugin/` directory
2. **Upload to WordPress**:
   - Go to your WordPress admin → Plugins → Add New → Upload Plugin
   - Upload `sparklewp-connector.zip`
   - Activate the plugin
3. **Get credentials**:
   - Go to Settings → SparkleWP in your WordPress admin
   - Copy the automatically generated credentials
4. **Connect in SparkleWP**:
   - Add your site in the Websites section
   - Use the credentials from the plugin settings
   - Test the connection

### Manual Application Password Setup

If you prefer to create application passwords manually:

1. **Go to your WordPress profile** (`/wp-admin/profile.php`)
2. **Scroll to Application Passwords** section
3. **Create new password** with name "SparkleWP"
4. **Copy the generated password** (shown only once)
5. **Use in SparkleWP** with your WordPress username

## Project Structure

```
sparklewp/
├── backend/
│   ├── src/
│   │   ├── index.js          # Main server file
│   │   ├── models/           # Database models (User, Website)
│   │   ├── routes/           # API routes (auth, users, websites, logs)
│   │   ├── middleware/       # Authentication and logging middleware
│   │   ├── utils/            # WordPress API client and utilities
│   │   └── seed/             # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components (Dashboard, Users, Websites, Logging)
│   │   ├── routes/          # App routing
│   │   └── services/        # API and auth services
│   └── package.json
├── wordpress-plugin/
│   ├── sparklewp-connector/
│   │   └── sparklewp-connector.php  # WordPress plugin for site integration
│   ├── sparklewp-connector.zip      # Installable plugin package
│   └── README.md                    # Plugin documentation
├── CHANGELOG.md             # Version history and updates
└── README.md
```

## Development Features

- **In-Memory Database**: MongoDB memory server for easy development
- **Auto-Reload**: Nodemon for backend and React dev server for frontend
- **Error Handling**: Comprehensive error handling and user feedback
- **Clean Architecture**: Separated concerns with clear file organization

## Future Enhancements

- [ ] Plugin and theme management (install/update/delete from dashboard)
- [ ] Backup and restore functionality
- [ ] Site analytics dashboard with detailed metrics
- [ ] Bulk operations across multiple sites
- [ ] Scheduled maintenance and updates
- [ ] Performance monitoring and optimization suggestions
- [ ] Custom dashboard widgets
- [ ] WordPress multisite network management
- [ ] Advanced user permissions and team collaboration
- [ ] API integrations with popular WordPress services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Cymric Studio**
Email: adrian@cymricstudio.com
GitHub: [@cymric-studio](https://github.com/cymric-studio)
