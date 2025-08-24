import { Router } from "express";
import { isAuthenticated } from "../githubAuth";
import rateLimit from "express-rate-limit";

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests to /analyze, please try again later."
});

const generateTestsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests to /generate-tests, please try again later."
});

const router = Router();

// AI Chat endpoint
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    const { message, code, language, fileName, history, personality } = req.body;

    // Build context with personality
    const systemPrompt = personality || "You are a professional coding assistant.";
    const contextPrompt = `${systemPrompt}

Here's the current context:
File: ${fileName || 'untitled'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Previous conversation:
${history?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'None'}

User question: ${message}

Please provide a helpful response about the code that matches your personality and communication style.`;

    // Call Gemini API with context
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
});

// AI Code Suggestions endpoint
router.post('/code-suggestions', isAuthenticated, async (req, res) => {
  try {
    const { code, language, fileName, cursorPosition, selectedText, personality } = req.body;

    // Build context for code suggestions
    const systemPrompt = personality || "You are a professional coding assistant.";
    const contextPrompt = `${systemPrompt}

Analyze this code and provide helpful suggestions for improvement, completion, or fixes:

File: ${fileName || 'untitled'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

${selectedText ? `Selected text: "${selectedText}"` : ''}
${cursorPosition ? `Cursor position: ${cursorPosition}` : ''}

Please provide 2-4 specific, actionable suggestions as a JSON array with this format:
[{
  "id": "unique_id",
  "type": "completion|refactor|fix|optimize|explain",
  "title": "Brief title",
  "description": "Detailed description",
  "code": "suggested code if applicable",
  "confidence": 0.8,
  "action": "what this suggestion does"
}]

Respond only with the JSON array, no other text.`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    try {
      const suggestions = JSON.parse(aiResponse);
      res.json({ suggestions });
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      res.json({ suggestions: [] });
    }
  } catch (error) {
    console.error('AI Suggestions error:', error);
    res.status(500).json({ message: 'Failed to get AI suggestions' });
  }
});

// AI Code Analysis endpoint  
router.post('/analyze', isAuthenticated, analyzeLimiter, async (req, res) => {
  try {
    const { code, language, fileName } = req.body;

    const contextPrompt = `Analyze this code and provide insights:

File: ${fileName || 'untitled'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Please analyze the code and provide:
1. Code quality score (0-100)
2. Complexity analysis
3. Performance insights
4. Security considerations
5. Best practices suggestions

Respond with JSON in this format:
{
  "quality": {
    "score": 85,
    "readability": "Good", 
    "maintainability": "Excellent",
    "performance": "Good"
  },
  "complexity": {
    "cyclomatic": "Medium",
    "cognitive": "Low"
  },
  "issues": [
    {
      "type": "performance",
      "severity": "medium",
      "line": 10,
      "message": "Consider optimizing this loop",
      "suggestion": "Use array methods for better performance"
    }
  ],
  "suggestions": [
    "Add error handling",
    "Consider using TypeScript interfaces"
  ]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    try {
      const analysis = JSON.parse(aiResponse);
      res.json({ analysis });
    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      res.json({ analysis: { quality: { score: 75 }, complexity: { cyclomatic: "Medium" }, issues: [], suggestions: [] } });
    }
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze code' });
  }
});

// AI Test Generation endpoint
router.post('/generate-tests', isAuthenticated, generateTestsLimiter, async (req, res) => {
  try {
    const { code, language, fileName } = req.body;

    const contextPrompt = `Generate comprehensive unit tests for this code:

File: ${fileName || 'untitled'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Please generate test cases that cover:
- Happy path scenarios
- Edge cases
- Error conditions
- Boundary conditions

Use appropriate testing framework for the language (Jest for JavaScript/TypeScript, pytest for Python, etc.).

Respond with just the test code, no explanations.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();
    const testCode = data.candidates?.[0]?.content?.parts?.[0]?.text || '// No tests generated';

    res.json({ testCode });
  } catch (error) {
    console.error('AI Test Generation error:', error);
    res.status(500).json({ message: 'Failed to generate tests' });
  }
});

// AI Documentation Generation endpoint
router.post('/generate-docs', isAuthenticated, async (req, res) => {
  try {
    const { code, language, fileName } = req.body;

    const contextPrompt = `Generate comprehensive documentation for this code:

File: ${fileName || 'untitled'}
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Please generate:
1. Overview/purpose of the code
2. Function/method documentation with parameters and return values
3. Usage examples
4. Any important notes or considerations

Use appropriate documentation format for the language (JSDoc for JavaScript/TypeScript, docstrings for Python, etc.).

Respond with just the documentation, properly formatted.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contextPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();
    const documentation = data.candidates?.[0]?.content?.parts?.[0]?.text || '// No documentation generated';

    res.json({ documentation });
  } catch (error) {
    console.error('AI Documentation error:', error);
    res.status(500).json({ message: 'Failed to generate documentation' });
  }
});

export default router;