const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No valid token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token with additional security checks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'sparklewp',
      audience: 'sparklewp-client'
    });

    // Add user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username
    };

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json({ message: 'Token verification failed' });
    }
  }
}; 