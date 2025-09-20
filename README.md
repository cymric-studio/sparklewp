# SparkleWP

A modern WordPress management application with a beautiful, responsive interface for managing multiple WordPress sites from a single dashboard.

## Features

### 🔐 Authentication System
- **Modern Login Interface**: Beautiful gradient design with form validation
- **Secure JWT Authentication**: Token-based authentication with rate limiting
- **Password Visibility Toggle**: User-friendly password input with show/hide functionality
- **Auto-logout**: Automatic session management

### 📊 Dashboard Interface
- **Responsive Sidebar**: Fixed navigation with gradient styling and active state indicators
- **Statistics Overview**: Quick stats cards showing site metrics
- **Welcome Messages**: Personalized user greetings
- **Quick Actions**: Easy access to common management tasks

### 🛡️ Security Features
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **Secure Password Hashing**: bcrypt for password protection
- **JWT Token Security**: Signed tokens with expiration

### 🎨 Modern UI/UX
- **No External Dependencies**: Uses reliable inline CSS for consistent styling
- **Mobile Responsive**: Works perfectly on all device sizes
- **Beautiful Gradients**: Modern color schemes and visual effects
- **Interactive Elements**: Hover effects and smooth transitions

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

## Project Structure

```
sparklewp/
├── backend/
│   ├── src/
│   │   ├── index.js          # Main server file
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Authentication middleware
│   │   └── seed/             # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # App routing
│   │   └── services/        # API and auth services
│   └── package.json
└── README.md
```

## Development Features

- **In-Memory Database**: MongoDB memory server for easy development
- **Auto-Reload**: Nodemon for backend and React dev server for frontend
- **Error Handling**: Comprehensive error handling and user feedback
- **Clean Architecture**: Separated concerns with clear file organization

## Future Enhancements

- [ ] Multi-site WordPress management
- [ ] Plugin and theme management
- [ ] Backup and restore functionality
- [ ] Performance monitoring
- [ ] User management system
- [ ] Site analytics dashboard

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
