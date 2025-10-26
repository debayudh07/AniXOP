import express, { Request, Response } from 'express';
import { generateConceptContent } from '../services/gemini';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware for authentication
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied'
    });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Generate and get concept content (with caching)
router.post('/concept/:conceptId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;
    
    // Map concept IDs to titles (from frontend)
    const conceptMap: Record<string, string> = {
      'defi': 'Introduction to DeFi',
      'amm': 'Automated Market Makers (AMM)',
      'lppools': 'Liquidity Pools & LP Tokens',
      'snipping': 'Token Sniping',
      'yield-farming': 'Yield Farming Strategies',
      'impermanent-loss': 'Impermanent Loss Explained',
      'smart-contracts': 'Smart Contract Basics',
      'front-running': 'Front-Running & MEV',
      'gas-fees': 'Understanding Gas Fees',
      'defi-protocols': 'Major DeFi Protocols',
      'rugpulls': 'Identifying Rug Pulls',
      'slashing': 'Slashing (Validator Penalties)',
    };
    
    const conceptTitle = conceptMap[conceptId] || conceptId;
    
    // Check if content is already cached in user's lessonProgress
    let existingProgress = user.lessonProgress.find((p: any) => p.conceptId === conceptId);
    
    if (existingProgress && existingProgress.content) {
      // Return cached content
      return res.json({
        success: true,
        data: existingProgress.content,
        status: existingProgress.status,
        progress: existingProgress.progress
      });
    }
    
    // Generate new content
    const content = await generateConceptContent(conceptTitle);
    
    // Mark lesson as opened if not already started
    const existingIndex = user.lessonProgress.findIndex((p: any) => p.conceptId === conceptId);
    
    if (existingIndex === -1) {
      // New lesson
      user.lessonProgress.push({
        conceptId,
        status: 'in_progress',
        progress: 0,
        lastOpenedAt: new Date(),
        timeSpent: 0,
        content: content
      });
    } else {
      // Existing lesson, update it
      user.lessonProgress[existingIndex].content = content;
      user.lessonProgress[existingIndex].lastOpenedAt = new Date();
      if (user.lessonProgress[existingIndex].status === 'not_started') {
        user.lessonProgress[existingIndex].status = 'in_progress';
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: content,
      status: 'in_progress',
      progress: existingProgress?.progress || 0
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content'
    });
  }
});

// Mark lesson as completed
router.post('/concept/:conceptId/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { conceptId } = req.params;
    const { timeSpent, quizScore } = req.body;
    
    const existingIndex = user.lessonProgress.findIndex((p: any) => p.conceptId === conceptId);
    
    if (existingIndex !== -1) {
      user.lessonProgress[existingIndex].status = 'completed';
      user.lessonProgress[existingIndex].progress = 100;
      user.lessonProgress[existingIndex].completedAt = new Date();
      if (timeSpent) user.lessonProgress[existingIndex].timeSpent += timeSpent;
      if (quizScore !== undefined) user.lessonProgress[existingIndex].quizScore = quizScore;
    }
    
    // Update total stats
    const completedCount = user.lessonProgress.filter((p: any) => p.status === 'completed').length;
    user.totalConceptsCompleted = completedCount;
    if (timeSpent) user.totalTimeSpent += timeSpent;
    
    // Update streak
    const today = new Date();
    const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : new Date(0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    }
    
    user.lastActiveDate = today;
    await user.save();
    
    // Refresh user to get updated stats
    await user.populate();
    
    res.json({
      success: true,
      message: 'Lesson completed',
      data: {
        streak: user.currentStreak,
        totalConceptsCompleted: user.totalConceptsCompleted,
        totalTimeSpent: user.totalTimeSpent,
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

// Get lesson progress for all concepts
router.get('/concepts/status', authenticateToken, async (req: Request, res: Response) => {
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

export default router;

