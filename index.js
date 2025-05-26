const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const chatRoutes = require('./routes/chatRoutes');
const marketingPlanRoutes = require('./routes/marketingPlanRoutes');
const mediaFilesRoutes = require('./routes/mediaFiles');


// Mount routes with clear paths
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/media-files', mediaRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/marketing-plans', marketingPlanRoutes);
app.use('/api/v1/media-files', mediaFilesRoutes);
// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Branding API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    status: 'Error', 
    message: 'Server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});