const mongoose = require('mongoose');

const logSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  maxSize: { type: Number, default: 1000 }, // Maximum number of log entries to keep
  retentionDays: { type: Number, default: 30 }, // Days to keep logs
  logLevel: {
    type: String,
    enum: ['all', 'errors_only', 'warnings_and_errors'],
    default: 'all'
  },
  excludeEndpoints: [{ type: String }], // Endpoints to exclude from logging
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, ref: 'User' }
});

// Ensure there's only one settings document
logSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

logSettingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(updates);
  } else {
    Object.assign(settings, updates);
  }
  settings.updatedAt = new Date();
  settings.updatedBy = userId;
  await settings.save();
  return settings;
};

module.exports = mongoose.model('LogSettings', logSettingsSchema);