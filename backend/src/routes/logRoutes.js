const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const LogSettings = require('../models/LogSettings');
const auth = require('../middleware/auth');

// Get all logs with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    if (req.query.method) {
      filter.method = req.query.method.toUpperCase();
    }

    if (req.query.status) {
      if (req.query.status === 'success') {
        filter.statusCode = { $gte: 200, $lt: 300 };
      } else if (req.query.status === 'error') {
        filter.statusCode = { $gte: 400 };
      }
    }

    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-requestHeaders -responseHeaders -requestBody -responseBody -errorStack');

    const total = await Log.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single log with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logging statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsLast24h,
      logsLastWeek,
      errorLogs,
      methodStats,
      statusStats
    ] = await Promise.all([
      Log.countDocuments(),
      Log.countDocuments({ timestamp: { $gte: oneDayAgo } }),
      Log.countDocuments({ timestamp: { $gte: oneWeekAgo } }),
      Log.countDocuments({ statusCode: { $gte: 400 } }),
      Log.aggregate([
        { $group: { _id: '$method', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $group: { _id: '$statusCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const avgResponseTime = await Log.aggregate([
      { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
    ]);

    res.json({
      totalLogs,
      logsLast24h,
      logsLastWeek,
      errorLogs,
      errorRate: totalLogs > 0 ? (errorLogs / totalLogs * 100).toFixed(2) : 0,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
      methodStats,
      statusStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logging settings
router.get('/settings/current', auth, async (req, res) => {
  try {
    const settings = await LogSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update logging settings
router.post('/settings', auth, async (req, res) => {
  try {
    const { enabled, maxSize, retentionDays, logLevel, excludeEndpoints } = req.body;

    const updates = {};
    if (typeof enabled === 'boolean') updates.enabled = enabled;
    if (typeof maxSize === 'number' && maxSize > 0) updates.maxSize = maxSize;
    if (typeof retentionDays === 'number' && retentionDays > 0) updates.retentionDays = retentionDays;
    if (logLevel) updates.logLevel = logLevel;
    if (Array.isArray(excludeEndpoints)) updates.excludeEndpoints = excludeEndpoints;

    const settings = await LogSettings.updateSettings(updates, req.user.username);

    res.json({ message: 'Logging settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear all logs
router.delete('/', auth, async (req, res) => {
  try {
    const result = await Log.deleteMany({});
    res.json({
      message: 'All logs cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear logs older than specified date
router.delete('/cleanup', auth, async (req, res) => {
  try {
    const { olderThan } = req.body;

    if (!olderThan) {
      return res.status(400).json({ message: 'olderThan date is required' });
    }

    const cutoffDate = new Date(olderThan);
    const result = await Log.deleteMany({ timestamp: { $lt: cutoffDate } });

    res.json({
      message: `Logs older than ${cutoffDate.toISOString()} cleared successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete specific log entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    await Log.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export logs as JSON
router.get('/export/json', auth, async (req, res) => {
  try {
    const filter = {};

    // Apply same filtering as get logs endpoint
    if (req.query.method) {
      filter.method = req.query.method.toUpperCase();
    }

    if (req.query.status) {
      if (req.query.status === 'success') {
        filter.statusCode = { $gte: 200, $lt: 300 };
      } else if (req.query.status === 'error') {
        filter.statusCode = { $gte: 400 };
      }
    }

    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .limit(1000); // Limit exports to 1000 entries

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sparklewp-logs-${new Date().toISOString().split('T')[0]}.json`);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;