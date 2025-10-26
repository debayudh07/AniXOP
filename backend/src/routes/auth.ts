import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getConnectionStatus } from '../config/database';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus = getConnectionStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected',
        message: 'Service temporarily unavailable'
      });
    }

    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
    });

    await user.save();

    // Generate token
    const token = generateToken(String(user._id));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: String(user._id),
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to register user'
    });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbStatus = getConnectionStatus();
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected',
        message: 'Service temporarily unavailable'
      });
    }

    const { email, password } = req.body;

    // Validationjj
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(String(user._id));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: String(user._id),
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to login'
    });
  }
});

// Database status route
router.get('/status', (req: Request, res: Response) => {
  const dbStatus = getConnectionStatus();
  res.json({
    success: true,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;

