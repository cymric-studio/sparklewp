require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const seedAdmin = require('./seed/seedAdmin');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/websites', websiteRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Start in-memory MongoDB server
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    console.log('Starting in-memory MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');

    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server startup error:', err);
  }
}

startServer(); 