import dotenv from 'dotenv';
// Load environment variables first, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import defiRoutes from './routes/defi';
import learningRoutes from './routes/learning';
import simulatorRoutes from './routes/simulator';
import synthesizeRoutes from './routes/defi-synthesize';
import { connectDB, getConnectionStatus } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/defi', defiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/synthesize', synthesizeRoutes);

// Health check with database status
app.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'ok',
    message: 'DeFi Learning Platform API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

