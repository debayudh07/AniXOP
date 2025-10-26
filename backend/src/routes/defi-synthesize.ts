import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User';

const router = express.Router();

const API_KEY = process.env.GEMINI_API_KEY || ' ';
const genAI = new GoogleGenerativeAI(API_KEY);

// Middleware to verify token
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

/**
 * Synthesize blockchain simulation results with AI
 * This route takes the on-chain results and uses AI to create an educational explanation
 */
router.post('/synthesize-results', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { concept, transactionData, reserves, results } = req.body;
    
    if (!concept || !transactionData) {
      return res.status(400).json({
        success: false,
        error: 'Missing concept or transaction data'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are a DeFi education expert. Analyze this blockchain transaction data and create an educational explanation.

Concept: ${concept}
Transaction Hash: ${transactionData.transactionHash || 'N/A'}

Transaction Data:
${JSON.stringify(transactionData, null, 2)}

Reserves (if applicable):
${reserves ? JSON.stringify(reserves, null, 2) : 'N/A'}

Create a comprehensive explanation that:
1. Explains what happened in this transaction in simple terms
2. Shows how the DeFi mechanism worked (AMM, Liquidity Pool, etc.)
3. Highlights the key numbers and what they mean
4. Explains any price changes or state changes
5. Makes it educational for someone learning DeFi

Format as JSON:
{
  "summary": "Brief 2-sentence summary",
  "explanation": "Detailed explanation in 3-4 paragraphs",
  "keyMetrics": ["metric1", "metric2", "metric3"],
  "insights": ["insight1", "insight2"],
  "learnings": ["learning1", "learning2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const synthesizedData = JSON.parse(jsonMatch[0]);
      
      res.json({
        success: true,
        data: synthesizedData
      });
    } else {
      res.json({
        success: true,
        data: {
          summary: "Transaction completed successfully",
          explanation: text,
          keyMetrics: [],
          insights: [],
          learnings: []
        }
      });
    }
  } catch (error: any) {
    console.error('Error synthesizing results:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to synthesize results'
    });
  }
});

export default router;

