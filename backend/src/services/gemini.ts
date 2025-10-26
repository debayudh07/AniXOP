import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface InteractiveContent {
  type: 'simulation' | 'scenario' | 'interactive_demo';
  title: string;
  description: string;
  steps?: string[];
  parameters?: Record<string, any>;
}

export interface ConceptContent {
  title: string;
  explanation: string[];
  keyTerms: { term: string; definition: string; }[];
  quiz: QuizQuestion[];
  interactive: InteractiveContent;
  risks: string[];
  mitigation: string[];
}

export async function generateConceptContent(conceptTitle: string): Promise<ConceptContent> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Create comprehensive educational content about ${conceptTitle} in DeFi (Decentralized Finance).

Provide:
1. A clear explanation broken into 3-4 concise paragraphs
2. Interactive quiz with 5 multiple-choice questions (each with 4 options)
3. Real-world scenario or simulation to practice
4. Key terms and definitions
5. Potential risks and mitigation strategies

Format as JSON with this EXACT structure:
{
  "title": "Concept Title",
  "explanation": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "keyTerms": [
    {"term": "term", "definition": "definition"}
  ],
  "quiz": [
    {
      "question": "question text",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": 0,
      "explanation": "why this is correct"
    }
  ],
  "interactive": {
    "type": "simulation" or "scenario" or "interactive_demo",
    "title": "Title",
    "description": "Description",
    "steps": ["step 1", "step 2"],
    "parameters": {}
  },
  "risks": ["risk 1", "risk 2"],
  "mitigation": ["mitigation 1", "mitigation 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and set defaults
      return {
        title: parsed.title || conceptTitle,
        explanation: Array.isArray(parsed.explanation) ? parsed.explanation : [parsed.explanation || ''],
        keyTerms: parsed.keyTerms || [],
        quiz: parsed.quiz || [],
        interactive: parsed.interactive || {
          type: 'scenario',
          title: 'Interactive Learning',
          description: 'Practice this concept',
          steps: []
        },
        risks: parsed.risks || [],
        mitigation: parsed.mitigation || []
      };
    }
    
    throw new Error('Failed to parse JSON from Gemini response');
  } catch (error) {
    console.error("Error generating content:", error);
    return getDefaultContent(conceptTitle);
  }
}

function getDefaultContent(conceptTitle: string): ConceptContent {
  return {
    title: conceptTitle,
    explanation: [
      `Learn about ${conceptTitle} in DeFi. This concept explores key aspects of decentralized finance protocols.`,
      'Understanding this concept is crucial for navigating the DeFi ecosystem safely and effectively.'
    ],
    keyTerms: [
      { term: 'Coming soon', definition: 'Content will be available shortly' }
    ],
    quiz: [],
    interactive: {
      type: 'scenario',
      title: 'Interactive Learning',
      description: 'Practice this concept',
      steps: []
    },
    risks: ['AI service unavailable'],
    mitigation: ['Please try again later']
  };
}

export async function generateQuizForConcept(conceptTitle: string, content: string): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Based on this content about ${conceptTitle}:
${content}

Generate 5 multiple-choice quiz questions. Each question should have 4 options and one correct answer.

Format as JSON array:
[
  {
    "question": "question text",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "correctAnswer": 0,
    "explanation": "why this is correct"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}

