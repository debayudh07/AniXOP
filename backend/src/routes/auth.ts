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

// Middleware to verify token
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
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

// Get user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: String(user._id),
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to retrieve profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { username, email } = req.body;

    const updateData: any = {};
    
    if (username !== undefined) {
      updateData.username = username;
    }

    if (email !== undefined && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
          message: 'This email is already in use'
        });
      }
      updateData.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: String(updatedUser._id),
          email: updatedUser.email,
          username: updatedUser.username,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Failed to update profile'
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

// Reset a specific lesson (removes from progress)
router.post('/reset-lesson/:conceptId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;

    // Remove the lesson from user's progress
    user.lessonProgress = user.lessonProgress.filter(
      (progress: any) => progress.conceptId !== conceptId
    );
    
    await user.save();

    res.json({
      success: true,
      message: 'Lesson progress reset successfully'
    });
  } catch (error: any) {
    console.error('Reset lesson error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset lesson'
    });
  }
});

export default router;

