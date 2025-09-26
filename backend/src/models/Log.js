const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  method: { type: String, required: true },
  url: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, required: true }, // in milliseconds
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  userId: { type: String, ref: 'User' },

  // Request data
  requestHeaders: mongoose.Schema.Types.Mixed,
  requestBody: mongoose.Schema.Types.Mixed,
  requestQuery: mongoose.Schema.Types.Mixed,

  // Response data
  responseHeaders: mongoose.Schema.Types.Mixed,
  responseBody: mongoose.Schema.Types.Mixed,

  // Error information
  errorMessage: String,
  errorStack: String
});

// Index for better query performance
logSchema.index({ timestamp: -1 });
logSchema.index({ method: 1 });
logSchema.index({ statusCode: 1 });
logSchema.index({ userId: 1 });

module.exports = mongoose.model('Log', logSchema);