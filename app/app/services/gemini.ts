import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface DeFiConcept {
  id: string;
  title: string;
  emoji: string;
  category: 'Basics' | 'Trading' | 'Advanced' | 'Security';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

export const defiConcepts: DeFiConcept[] = [
  {
    id: 'snipping',
    title: 'Token Sniping',
    emoji: '🎯',
    category: 'Trading',
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  },
  {
    id: 'slashing',
    title: 'Slashing (Validator Penalties)',
    emoji: '⚡',
    category: 'Advanced',
    difficulty: 'Advanced',
    estimatedTime: '20 min'
  },
  {
    id: 'rugpulls',
    title: 'Identifying Rug Pulls',
    emoji: '🚨',
    category: 'Security',
    difficulty: 'Beginner',
    estimatedTime: '12 min'
  },
  {
    id: 'lppools',
    title: 'Liquidity Pools & LP Tokens',
    emoji: '💧',
    category: 'Basics',
    difficulty: 'Beginner',
    estimatedTime: '18 min'
  },
  {
    id: 'defi',
    title: 'Introduction to DeFi',
    emoji: '🏦',
    category: 'Basics',
    difficulty: 'Beginner',
    estimatedTime: '10 min'
  },
  {
    id: 'amm',
    title: 'Automated Market Makers (AMM)',
    emoji: '🤖',
    category: 'Basics',
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  },
  {
    id: 'yield-farming',
    title: 'Yield Farming Strategies',
    emoji: '🌾',
    category: 'Advanced',
    difficulty: 'Advanced',
    estimatedTime: '25 min'
  },
  {
    id: 'impermanent-loss',
    title: 'Impermanent Loss Explained',
    emoji: '📉',
    category: 'Advanced',
    difficulty: 'Advanced',
    estimatedTime: '20 min'
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contract Basics',
    emoji: '📜',
    category: 'Basics',
    difficulty: 'Beginner',
    estimatedTime: '12 min'
  },
  {
    id: 'front-running',
    title: 'Front-Running & MEV',
    emoji: '⚔️',
    category: 'Advanced',
    difficulty: 'Advanced',
    estimatedTime: '18 min'
  },
  {
    id: 'gas-fees',
    title: 'Understanding Gas Fees',
    emoji: '⛽',
    category: 'Basics',
    difficulty: 'Beginner',
    estimatedTime: '10 min'
  },
  {
    id: 'defi-protocols',
    title: 'Major DeFi Protocols',
    emoji: '🏛️',
    category: 'Basics',
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  }
];

export async function generateConceptContent(conceptTitle: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Create comprehensive educational content about ${conceptTitle} in DeFi (Decentralized Finance). 

Provide:
1. A clear, beginner-friendly explanation (3-4 paragraphs)
2. Real-world examples and use cases
3. Key concepts and terminology
4. Potential risks and how to mitigate them
5. A practical simulation scenario that demonstrates the concept

Format as JSON with these keys:
{
  "title": "Concept Title",
  "explanation": "Main explanation text",
  "examples": ["example 1", "example 2"],
  "keyTerms": [{"term": "term", "definition": "definition"}],
  "risks": ["risk 1", "risk 2"],
  "mitigation": ["mitigation 1", "mitigation 2"],
  "simulation": {
    "scenario": "Description of simulation scenario",
    "steps": ["step 1", "step 2"],
    "visualization": "Description of what to visualize"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      title: conceptTitle,
      explanation: text,
      examples: [],
      keyTerms: [],
      risks: [],
      mitigation: [],
      simulation: { scenario: "", steps: [], visualization: "" }
    };
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      title: conceptTitle,
      explanation: `Learn about ${conceptTitle} in DeFi. This concept explores key aspects of decentralized finance protocols.`,
      examples: ["Coming soon"],
      keyTerms: [{ term: "Coming soon", definition: "Content will be available shortly" }],
      risks: ["AI service unavailable"],
      mitigation: ["Please try again later"],
      simulation: { scenario: "", steps: [], visualization: "" }
    };
  }
}

