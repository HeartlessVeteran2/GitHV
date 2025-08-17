import { Router } from "express";
import { isAuthenticated } from "../replitAuth";

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

export default router;