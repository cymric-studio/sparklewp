# Contributing to SparkleWP

Thank you for your interest in contributing to SparkleWP! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/sparklewp.git
   cd sparklewp
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### Installation
1. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application
1. **Start the backend** (from `/backend`):
   ```bash
   npm run dev
   ```

2. **Start the frontend** (from `/frontend`):
   ```bash
   npm start
   ```

## Contribution Guidelines

### Code Style
- Follow existing code formatting and style
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure responsive design for UI changes

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, etc.)
- Keep the first line under 50 characters
- Use the body to explain what and why, not how

Example:
```
Add WordPress plugin auto-installer feature

- Implements automatic plugin installation from dashboard
- Adds progress tracking and error handling
- Updates UI with installation status indicators
```

### Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Update the CHANGELOG.md** with your changes
4. **Create a pull request** with:
   - Clear title and description
   - Link to any related issues
   - Screenshots for UI changes
   - Test instructions

### Areas for Contribution

#### High Priority
- Plugin and theme management features
- Backup and restore functionality
- Performance monitoring tools
- Enhanced security features

#### Medium Priority
- UI/UX improvements
- Additional authentication methods
- API optimizations
- Mobile responsiveness enhancements

#### Documentation
- Code documentation improvements
- Tutorial and guide creation
- API documentation
- User manual updates

## Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment information**:
   - OS and version
   - Node.js version
   - Browser and version (for frontend issues)
   - WordPress version (for plugin issues)
5. **Screenshots or error logs** if applicable

## Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Provide clear use case** and rationale
3. **Describe the expected behavior**
4. **Consider implementation complexity**
5. **Be open to alternative solutions**

## WordPress Plugin Development

### Plugin Structure
- Follow WordPress coding standards
- Use proper sanitization and validation
- Implement proper error handling
- Test with multiple WordPress versions

### Testing the Plugin
1. **Install on test WordPress site**
2. **Test all authentication methods**
3. **Verify compatibility** with latest WordPress
4. **Check for conflicts** with common plugins

## Security Considerations

- **Never commit sensitive data** (passwords, API keys, etc.)
- **Follow security best practices** for authentication
- **Validate and sanitize all inputs**
- **Use HTTPS for all external communications**
- **Report security issues privately** to adrian@cymricstudio.com

## Code Review Process

All contributions go through code review:

1. **Automated checks** must pass
2. **Maintainer review** for code quality and standards
3. **Testing verification** by maintainers
4. **Documentation review** if applicable

## Recognition

Contributors will be:
- **Listed in project credits**
- **Mentioned in release notes** for significant contributions
- **Given attribution** in commit messages and documentation

## Questions and Support

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: adrian@cymricstudio.com for private inquiries

## License

By contributing to SparkleWP, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SparkleWP! 🎉