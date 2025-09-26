const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'pending'],
    default: 'pending'
  },
  connectionMethod: {
    type: String,
    enum: ['application_password', 'jwt_token', 'api_key', 'oauth'],
    default: 'application_password'
  },
  // Store encrypted connection data
  connectionData: {
    username: String,
    // Note: passwords should be encrypted in production
    encryptedPassword: String,
    apiKey: String
  },
  // WordPress site information
  wpVersion: String,
  themes: { type: Number, default: 0 },
  plugins: { type: Number, default: 0 },
  lastSync: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

websiteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Website', websiteSchema);