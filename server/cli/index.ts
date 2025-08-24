import { Router } from 'express';
import { isAuthenticated } from '../githubAuth';
import rateLimit from 'express-rate-limit';
import { executeGcloudCommand, getGcloudHelp } from './gcloud';
import { executeGitHubCommand, getGitHubCliHelp } from './github';
import { executeGeminiCommand, getGeminiHelp } from './gemini';
import { formatOutput } from './base';

// Rate limiter for CLI commands
const cliLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 CLI commands per minute
  keyGenerator: (req: any) => req?.user?.id || req.ip, // eslint-disable-line @typescript-eslint/no-explicit-any
  message: "Too many CLI commands, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Execute CLI commands
router.post('/execute', isAuthenticated, cliLimiter, async (req, res) => {
  try {
    const { command, code, language, fileName, instructions } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    const commandLower = command.trim().toLowerCase();
    let result;

    if (commandLower.startsWith('gcloud')) {
      result = await executeGcloudCommand(command);
    } else if (commandLower.startsWith('gh ')) {
      result = await executeGitHubCommand(command);
    } else if (commandLower.startsWith('gemini')) {
      result = await executeGeminiCommand(command, {
        code,
        language,
        fileName,
        instructions
      });
    } else {
      result = {
        success: false,
        output: '',
        error: `Unknown CLI tool. Supported: gcloud, gh, gemini`
      };
    }

    res.json({
      success: result.success,
      output: formatOutput(result),
      error: result.error,
      exitCode: result.exitCode
    });

  } catch (error: unknown) {
    handleError(error);
    res.status(500).json({ 
      success: false,
      error: 'CLI command execution failed',
      output: ''
    });
  }
});

// Get help for CLI tools
router.get('/help/:tool?', isAuthenticated, (req, res) => {
  const { tool } = req.params;
  
  let helpText = '';
  
  switch (tool) {
    case 'gcloud':
      helpText = getGcloudHelp();
      break;
    case 'gh':
    case 'github':
      helpText = getGitHubCliHelp();
      break;
    case 'gemini':
      helpText = getGeminiHelp();
      break;
    default:
      helpText = `GitHV CLI Integration

Available CLI Tools:
  gcloud                       - Google Cloud CLI
  gh                           - GitHub CLI  
  gemini                       - Gemini AI CLI

Get specific help:
  GET /api/cli/help/gcloud     - Google Cloud CLI help
  GET /api/cli/help/gh         - GitHub CLI help
  GET /api/cli/help/gemini     - Gemini AI CLI help

Execute commands:
  POST /api/cli/execute        - Execute CLI commands
  
Security: Only safe, read-only commands are allowed.`;
  }
  
  res.json({ help: helpText });
});

// Check CLI tool availability
router.get('/status', isAuthenticated, cliLimiter, async (req, res) => {
  try {
    // Check if CLI tools are available
    const gcloudResult = await executeGcloudCommand('gcloud version');
    const ghResult = await executeGitHubCommand('gh version');
    
    res.json({
      gcloud: {
        available: gcloudResult.success,
        version: gcloudResult.success ? gcloudResult.output : null
      },
      github: {
        available: ghResult.success,
        version: ghResult.success ? ghResult.output : null
      },
      gemini: {
        available: true,
        version: 'Gemini CLI v1.0.0 (Powered by Gemini 2.5 Pro)'
      }
    });
  } catch (error) {
    console.error('CLI status check error:', error);
    res.status(500).json({ error: 'Failed to check CLI status' });
  }
});

export default router;