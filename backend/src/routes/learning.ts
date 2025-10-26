import express, { Request, Response } from 'express';
import User, { LessonProgress } from '../models/User';

const router = express.Router();

// Middleware to verify token (copy from auth.ts)
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Get user stats
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    res.json({
      success: true,
      data: {
        totalTimeSpent: user.totalTimeSpent,
        totalConceptsCompleted: user.totalConceptsCompleted,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalConcepts: user.lessonProgress.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get lesson progress
router.get('/progress/:conceptId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;
    
    const progress = user.lessonProgress.find((p: LessonProgress) => 
      p.conceptId === conceptId
    );
    
    res.json({
      success: true,
      data: progress || null
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update lesson progress
router.post('/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId, status, progress, timeSpent, quizScore } = req.body;

    if (!conceptId) {
      return res.status(400).json({
        success: false,
        error: 'Concept ID is required'
      });
    }

    const existingIndex = user.lessonProgress.findIndex(
      (p: LessonProgress) => p.conceptId === conceptId
    );

    const progressData: any = {
      conceptId,
      lastOpenedAt: new Date(),
      timeSpent: timeSpent || 0,
    };

    if (status) progressData.status = status;
    if (progress !== undefined) progressData.progress = progress;
    if (timeSpent) progressData.timeSpent = timeSpent;
    if (quizScore !== undefined) progressData.quizScore = quizScore;

    if (existingIndex !== -1) {
      user.lessonProgress[existingIndex] = {
        ...user.lessonProgress[existingIndex].toObject(),
        ...progressData
      };
    } else {
      user.lessonProgress.push(progressData);
    }

    // Update total stats if completed
    if (status === 'completed') {
      const existingProgress = user.lessonProgress[existingIndex];
      if (!existingProgress || existingProgress.status !== 'completed') {
        user.totalConceptsCompleted += 1;
      }
      if (timeSpent) {
        user.totalTimeSpent += timeSpent;
      }
    }

    // Update streak
    const today = new Date();
    const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : new Date(0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else {
      // Streak broken, reset to 1
      user.currentStreak = 1;
    }
    
    user.lastActiveDate = today;
    await user.save();

    res.json({
      success: true,
      message: 'Progress updated',
      data: user.lessonProgress.find((p: LessonProgress) => p.conceptId === conceptId)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all lesson progress
router.get('/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    res.json({
      success: true,
      data: user.lessonProgress
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark lesson as started
router.post('/start/:conceptId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;
    
    const existingIndex = user.lessonProgress.findIndex(
      (p: LessonProgress) => p.conceptId === conceptId
    );

    if (existingIndex !== -1) {
      user.lessonProgress[existingIndex].status = 'in_progress';
      user.lessonProgress[existingIndex].lastOpenedAt = new Date();
    } else {
      user.lessonProgress.push({
        conceptId,
        status: 'in_progress',
        progress: 0,
        lastOpenedAt: new Date(),
        timeSpent: 0
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Lesson started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark lesson as completed
router.post('/complete/:conceptId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;
    const { timeSpent, quizScore } = req.body;
    
    const existingIndex = user.lessonProgress.findIndex(
      (p: LessonProgress) => p.conceptId === conceptId
    );

    if (existingIndex !== -1) {
      user.lessonProgress[existingIndex].status = 'completed';
      user.lessonProgress[existingIndex].progress = 100;
      user.lessonProgress[existingIndex].completedAt = new Date();
      if (timeSpent) user.lessonProgress[existingIndex].timeSpent = timeSpent;
      if (quizScore !== undefined) user.lessonProgress[existingIndex].quizScore = quizScore;
    } else {
      user.lessonProgress.push({
        conceptId,
        status: 'completed',
        progress: 100,
        lastOpenedAt: new Date(),
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
        quizScore
      });
    }

    // Update total stats
    const existingProgress = user.lessonProgress[existingIndex];
    if (!existingProgress || existingProgress.status !== 'completed') {
      user.totalConceptsCompleted += 1;
    }
    if (timeSpent) user.totalTimeSpent += timeSpent;

    await user.save();

    res.json({
      success: true,
      message: 'Lesson completed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

