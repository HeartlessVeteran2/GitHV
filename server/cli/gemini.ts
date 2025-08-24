import { CLIResult } from './base';
import { explainCode, generateCodeCompletion, analyzeCode, generateTests, generateDocumentation, refactorCode } from '../gemini';

export interface GeminiCLIOptions {
  code?: string;
  language?: string;
  instructions?: string;
  fileName?: string;
}

/**
 * Execute Gemini CLI commands
 */
export async function executeGeminiCommand(
  commandString: string, 
  options: GeminiCLIOptions = {}
): Promise<CLIResult> {
  const args = commandString.trim().split(/\s+/);
  const subCommand = args[1]; // First arg after 'gemini'

  try {
    switch (subCommand) {
      case 'explain': {
        if (!options.code || !options.language) {
          return {
            success: false,
            output: '',
            error: 'Code and language are required for explain command'
          };
        }
        const explanation = await explainCode(options.code, options.language);
        return {
          success: true,
          output: explanation
        };
      }

      case 'analyze': {
        if (!options.code || !options.language) {
          return {
            success: false,
            output: '',
            error: 'Code and language are required for analyze command'
          };
        }
        const analysis = await analyzeCode(options.code, options.language);
        return {
          success: true,
          output: JSON.stringify(analysis, null, 2)
        };
      }

      case 'test':
      case 'tests': {
        if (!options.code || !options.language) {
          return {
            success: false,
            output: '',
            error: 'Code and language are required for test generation'
          };
        }
        const tests = await generateTests(options.code, options.language);
        return {
          success: true,
          output: tests
        };
      }

      case 'docs':
      case 'documentation': {
        if (!options.code || !options.language) {
          return {
            success: false,
            output: '',
            error: 'Code and language are required for documentation generation'
          };
        }
        const docs = await generateDocumentation(options.code, options.language);
        return {
          success: true,
          output: docs
        };
      }

      case 'refactor': {
        if (!options.code || !options.language || !options.instructions) {
          return {
            success: false,
            output: '',
            error: 'Code, language, and instructions are required for refactoring'
          };
        }
        const refactored = await refactorCode(options.code, options.language, options.instructions);
        return {
          success: true,
          output: refactored
        };
      }

      case 'complete':
      case 'completion': {
        if (!options.code || !options.language) {
          return {
            success: false,
            output: '',
            error: 'Code and language are required for completion'
          };
        }
        const suggestions = await generateCodeCompletion(
          options.code, 
          options.language, 
          { line: 0, column: 0 } // Default cursor position
        );
        return {
          success: true,
          output: JSON.stringify(suggestions, null, 2)
        };
      }

      case 'help':
        return {
          success: true,
          output: getGeminiHelp()
        };

      case 'version':
          output: GEMINI_CLI_VERSION
        };

      default:
        return {
          success: false,
          output: '',
          error: `Unknown Gemini command: ${subCommand}. Use "gemini help" for available commands.`
        };
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      output: '',
      error: `Gemini command failed: ${err.message || 'Unknown error'}`
    };
  }
}

/**
 * Get Gemini CLI help information
 */
export function getGeminiHelp(): string {
  return `Gemini AI CLI Commands:

Code Analysis:
  gemini explain               - Explain the current code
  gemini analyze               - Analyze code quality and issues
  gemini complete              - Get code completion suggestions

Code Generation:
  gemini test                  - Generate unit tests for code
  gemini docs                  - Generate documentation
  gemini refactor              - Refactor code with instructions

General:
  gemini version               - Show Gemini CLI version
  gemini help                  - Show this help message

Usage:
- Most commands work with the currently open file
- For refactor command, provide instructions in quotes
- All commands require active code context

Examples:
  gemini explain               # Explain current code
  gemini analyze               # Analyze current code
  gemini test                  # Generate tests for current code
  gemini refactor "optimize performance" # Refactor with instructions

Note: Commands operate on the current file context in the editor.`;
}