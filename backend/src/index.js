require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const seedAdmin = require('./seed/seedAdmin');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/sparkle';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err)); 