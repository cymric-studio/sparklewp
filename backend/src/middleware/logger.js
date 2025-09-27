const Log = require('../models/Log');
const LogSettings = require('../models/LogSettings');

class RequestLogger {
  constructor() {
    this.settings = null;
    this.loadSettings();
    // Reload settings every 5 minutes
    setInterval(() => this.loadSettings(), 5 * 60 * 1000);
  }

  async loadSettings() {
    try {
      this.settings = await LogSettings.getSettings();
    } catch (error) {
      console.error('Failed to load logging settings:', error);
      // Use default settings if loading fails
      this.settings = {
        enabled: true,
        maxSize: 1000,
        retentionDays: 30,
        logLevel: 'all',
        excludeEndpoints: []
      };
    }
  }

  shouldLog(req, res) {
    if (!this.settings || !this.settings.enabled) {
      return false;
    }

    // Check if endpoint should be excluded
    if (this.settings.excludeEndpoints.some(endpoint => req.url.includes(endpoint))) {
      return false;
    }

    // Check log level
    const statusCode = res.statusCode;
    switch (this.settings.logLevel) {
      case 'errors_only':
        return statusCode >= 400;
      case 'warnings_and_errors':
        return statusCode >= 300;
      case 'all':
      default:
        return true;
    }
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***';
      }
    });
    return sanitized;
  }

  sanitizeBody(body, contentType = '') {
    if (!body) return body;

    // Don't log large bodies (> 10KB)
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    if (bodyStr.length > 10240) {
      return { message: 'Body too large to log', size: bodyStr.length };
    }

    // For JSON bodies, sanitize sensitive fields
    if (contentType.includes('application/json') && typeof body === 'object') {
      const sanitized = { ...body };
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];

      const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const result = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            result[key] = '***';
          } else if (typeof value === 'object') {
            result[key] = sanitizeObject(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      };

      return sanitizeObject(sanitized);
    }

    return body;
  }

  async cleanupOldLogs() {
    try {
      if (!this.settings) return;

      // Remove logs older than retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.settings.retentionDays);

      await Log.deleteMany({ timestamp: { $lt: cutoffDate } });

      // Limit total number of logs
      const totalLogs = await Log.countDocuments();
      if (totalLogs > this.settings.maxSize) {
        const logsToDelete = totalLogs - this.settings.maxSize;
        const oldestLogs = await Log.find()
          .sort({ timestamp: 1 })
          .limit(logsToDelete)
          .select('_id');

        const idsToDelete = oldestLogs.map(log => log._id);
        await Log.deleteMany({ _id: { $in: idsToDelete } });

        console.log(`Cleaned up ${logsToDelete} old log entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  middleware() {
    return (req, res, next) => {
      // Skip logging for static files, health checks, and admin actions
      // BUT include website API calls so we can debug WordPress connections
      if (req.url.startsWith('/static') ||
          req.url === '/health' ||
          req.url.startsWith('/api/logs') ||
          req.url.startsWith('/api/users') ||
          req.url.startsWith('/api/auth')) {
        return next();
      }

      const startTime = Date.now();
      const self = this;

      // Capture original send function
      const originalSend = res.send;
      let responseBody = null;

      res.send = function(body) {
        responseBody = body;
        return originalSend.call(this, body);
      };

      // Continue with request processing
      res.on('finish', async () => {
        try {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Check if we should log this request
          if (!self.shouldLog(req, res)) {
            return;
          }

          // Extract user ID from request (if authenticated)
          let userId = null;
          try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (token) {
              const jwt = require('jsonwebtoken');
              const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
              userId = decoded.username;
            }
          } catch (err) {
            // Token verification failed, continue without user ID
          }

          // Parse response body if it's JSON
          let parsedResponseBody = responseBody;
          try {
            if (typeof responseBody === 'string' && responseBody.startsWith('{')) {
              parsedResponseBody = JSON.parse(responseBody);
            }
          } catch (e) {
            // Keep original response body if parsing fails
          }

          const logEntry = new Log({
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date(startTime),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId,

            requestHeaders: self.sanitizeHeaders(req.headers),
            requestBody: self.sanitizeBody(req.body, req.get('Content-Type')),
            requestQuery: req.query,

            responseHeaders: self.sanitizeHeaders(res.getHeaders()),
            responseBody: self.sanitizeBody(parsedResponseBody, res.get('Content-Type'))
          });

          await logEntry.save();

          // Periodically cleanup old logs (run every 100 requests)
          if (Math.random() < 0.01) {
            setImmediate(() => self.cleanupOldLogs());
          }

        } catch (error) {
          console.error('Failed to log request:', error);
        }
      });

      next();
    };
  }
}

// Create singleton instance
const requestLogger = new RequestLogger();

module.exports = requestLogger;