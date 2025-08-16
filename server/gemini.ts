import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CodeSuggestion {
  code: string;
  explanation: string;
  confidence: number;
}

export interface CodeAnalysis {
  issues: Array<{
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  quality_score: number;
  suggestions: string[];
}

export async function generateCodeCompletion(
  code: string,
  language: string,
  cursorPosition: { line: number; column: number }
): Promise<CodeSuggestion[]> {
  try {
    const prompt = `You are an expert ${language} developer. Given the following code context, provide 3 intelligent code completion suggestions for the cursor position at line ${cursorPosition.line}, column ${cursorPosition.column}.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide suggestions as JSON array with format:
[{"code": "completion_text", "explanation": "why this suggestion", "confidence": 0.9}]

Focus on:
- Contextually relevant completions
- Best practices for ${language}
- Common patterns and idioms
- Type safety where applicable`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              code: { type: "string" },
              explanation: { type: "string" },
              confidence: { type: "number" }
            },
            required: ["code", "explanation", "confidence"]
          }
        }
      },
      contents: prompt
    });

    const suggestions = JSON.parse(response.text || "[]");
    return suggestions.slice(0, 3);
  } catch (error) {
    console.error("Code completion error:", error);
    return [];
  }
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  try {
    const prompt = `Analyze this ${language} code for potential issues, bugs, performance problems, and code quality. Provide detailed feedback.

Code:
\`\`\`${language}
${code}
\`\`\`

Return analysis as JSON with format:
{
  "issues": [{"line": 5, "severity": "warning", "message": "issue description", "suggestion": "how to fix"}],
  "quality_score": 0.85,
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}

Focus on:
- Syntax errors and potential bugs
- Performance optimizations
- Security vulnerabilities
- Code style and best practices
- Type safety issues`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  line: { type: "number" },
                  severity: { type: "string", enum: ["error", "warning", "info"] },
                  message: { type: "string" },
                  suggestion: { type: "string" }
                },
                required: ["line", "severity", "message", "suggestion"]
              }
            },
            quality_score: { type: "number" },
            suggestions: { type: "array", items: { type: "string" } }
          },
          required: ["issues", "quality_score", "suggestions"]
        }
      },
      contents: prompt
    });

    return JSON.parse(response.text || '{"issues":[],"quality_score":0.5,"suggestions":[]}');
  } catch (error) {
    console.error("Code analysis error:", error);
    return { issues: [], quality_score: 0.5, suggestions: [] };
  }
}

export async function generateDocumentation(code: string, language: string): Promise<string> {
  try {
    const prompt = `Generate comprehensive documentation for this ${language} code. Include:
- Function/class descriptions
- Parameter explanations
- Return value descriptions
- Usage examples
- Notes about complexity or important behaviors

Code:
\`\`\`${language}
${code}
\`\`\`

Provide clean, well-formatted documentation:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Documentation generation failed";
  } catch (error) {
    console.error("Documentation generation error:", error);
    return "Documentation generation failed";
  }
}

export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const prompt = `Explain this ${language} code in clear, simple terms. Break down what it does step by step.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a clear explanation suitable for developers:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Code explanation failed";
  } catch (error) {
    console.error("Code explanation error:", error);
    return "Code explanation failed";
  }
}

export async function generateTests(code: string, language: string): Promise<string> {
  try {
    const framework = language === 'javascript' || language === 'typescript' ? 'Jest' : 
                     language === 'python' ? 'pytest' : 'appropriate testing framework';

    const prompt = `Generate comprehensive unit tests for this ${language} code using ${framework}.

Code:
\`\`\`${language}
${code}
\`\`\`

Include:
- Test cases for normal functionality
- Edge cases and error handling
- Mock dependencies where needed
- Clear test descriptions

Provide complete, runnable test code:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Test generation failed";
  } catch (error) {
    console.error("Test generation error:", error);
    return "Test generation failed";
  }
}

export async function refactorCode(code: string, language: string, instructions: string): Promise<string> {
  try {
    const prompt = `Refactor this ${language} code according to these instructions: ${instructions}

Original code:
\`\`\`${language}
${code}
\`\`\`

Provide the refactored code with improvements while maintaining functionality:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt
    });

    return response.text || "Refactoring failed";
  } catch (error) {
    console.error("Refactoring error:", error);
    return "Refactoring failed";
  }
}