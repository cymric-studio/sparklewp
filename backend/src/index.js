require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const logRoutes = require('./routes/logRoutes');
const requestLogger = require('./middleware/logger');
const seedAdmin = require('./seed/seedAdmin');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(helmet());

// Add request logging middleware
app.use(requestLogger.middleware());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri;

    // Check if using external MongoDB or in-memory
    if (process.env.MONGO_URI && process.env.USE_REAL_MONGO === 'true') {
      // Use real MongoDB (for Docker/production)
      mongoUri = process.env.MONGO_URI;
      console.log('Connecting to MongoDB at:', mongoUri.replace(/\/\/.*@/, '//<credentials>@')); // Hide credentials in logs
    } else {
      // Use in-memory MongoDB (for local development)
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('Starting in-memory MongoDB...');
    }

    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');

    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

startServer(); 