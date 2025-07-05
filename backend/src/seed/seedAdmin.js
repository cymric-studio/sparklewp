const User = require('../models/User');

module.exports = async function seedAdmin() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'administrator'
    });
    console.log('Default admin user created.');
  }
}; 