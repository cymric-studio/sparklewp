const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// Add new user
router.post('/', auth, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const user = await User.create({ username, email, password, role });
    res.status(201).json({ username: user.username, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 