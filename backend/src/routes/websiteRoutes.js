const express = require('express');
const router = express.Router();
const Website = require('../models/Website');
const auth = require('../middleware/auth');
const WordPressApiClient = require('../utils/wordpressApi');

// Get all websites
router.get('/', auth, async (req, res) => {
  try {
    const websites = await Website.find().select('-connectionData.encryptedPassword');
    res.json(websites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single website
router.get('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findById(req.params.id).select('-connectionData.encryptedPassword');
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    res.json(website);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new website
router.post('/', auth, async (req, res) => {
  try {
    const { name, url, description } = req.body;

    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    // Validate URL format
    let sanitizedUrl;
    try {
      sanitizedUrl = new URL(url).href;
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Check if website already exists
    const existingWebsite = await Website.findOne({ url: sanitizedUrl });
    if (existingWebsite) {
      return res.status(400).json({ message: 'Website with this URL already exists' });
    }

    // Note: WordPress validation will happen during connection attempt

    const website = new Website({
      name,
      url: sanitizedUrl,
      description,
      status: 'pending'
    });

    await website.save();

    // Return website without sensitive data
    const responseWebsite = website.toObject();
    delete responseWebsite.connectionData;

    res.status(201).json(responseWebsite);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update website
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    if (name) website.name = name;
    if (description !== undefined) website.description = description;

    await website.save();

    // Return website without sensitive data
    const responseWebsite = website.toObject();
    delete responseWebsite.connectionData;

    res.json(responseWebsite);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Connect to website (store connection credentials)
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const { method, username, password, apiKey } = req.body;

    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Basic validation
    if (method === 'application_password' && (!username || !password)) {
      return res.status(400).json({ message: 'Username and password are required for application password method' });
    }

    // Create WordPress API client
    const wpClient = new WordPressApiClient(website.url, {
      method,
      username,
      password,
      apiKey
    });

    try {
      // Test actual WordPress connection
      console.log(`Testing connection to ${website.url}...`);
      const connectionResult = await wpClient.testConnection();

      // Store connection data (in production, encrypt the password)
      website.connectionMethod = method;
      website.connectionData = {
        username: username || '',
        encryptedPassword: password || '', // TODO: Encrypt this in production
        apiKey: apiKey || ''
      };

      // Update website with successful connection data
      website.status = 'connected';
      website.lastSync = new Date();
      website.wpVersion = connectionResult.siteInfo.wpVersion;

      // Get site stats
      try {
        const stats = await wpClient.getSiteStats();
        website.themes = stats.themes;
        website.plugins = stats.plugins;
      } catch (statsError) {
        console.log('Could not fetch site stats:', statsError.message);
        // Set default values if stats can't be fetched
        website.themes = 0;
        website.plugins = 0;
      }

      await website.save();

      // Return website without sensitive data
      const responseWebsite = website.toObject();
      delete responseWebsite.connectionData;

      res.json({
        message: 'Website connected successfully',
        website: responseWebsite,
        siteInfo: connectionResult.siteInfo
      });

    } catch (connectionError) {
      console.log('Connection failed:', connectionError.message);

      // Update website status to disconnected
      website.status = 'disconnected';
      await website.save();

      res.status(400).json({
        message: 'Failed to connect to WordPress site',
        error: connectionError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test connection
router.post('/:id/test', auth, async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    if (website.status !== 'connected' || !website.connectionData) {
      return res.status(400).json({ message: 'Website is not connected. Please connect first.' });
    }

    // Create WordPress API client with stored credentials
    const wpClient = new WordPressApiClient(website.url, {
      method: website.connectionMethod,
      username: website.connectionData.username,
      password: website.connectionData.encryptedPassword, // In production, decrypt this
      apiKey: website.connectionData.apiKey
    });

    try {
      const connectionResult = await wpClient.testConnection();

      // Update sync time and data
      website.lastSync = new Date();
      website.wpVersion = connectionResult.siteInfo.wpVersion;

      // Get updated stats
      try {
        const stats = await wpClient.getSiteStats();
        website.themes = stats.themes;
        website.plugins = stats.plugins;
      } catch (statsError) {
        console.log('Could not fetch site stats during test:', statsError.message);
      }

      await website.save();

      const responseWebsite = website.toObject();
      delete responseWebsite.connectionData;

      res.json({
        message: 'Connection test successful',
        website: responseWebsite,
        siteInfo: connectionResult.siteInfo
      });

    } catch (connectionError) {
      // Update status to disconnected if connection fails
      website.status = 'disconnected';
      await website.save();

      res.status(400).json({
        message: 'Connection test failed',
        error: connectionError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete website
router.delete('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    await Website.findByIdAndDelete(req.params.id);
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;