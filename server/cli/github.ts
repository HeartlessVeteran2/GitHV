import { executeCommand, CLIResult, parseCommand } from './base';

// Safe gh subcommands (read-only operations)
const SAFE_SUBCOMMANDS = [
  'auth status',
  'auth list',
  'repo list',
  'repo view',
  'repo clone',
  'issue list',
  'issue view',
  'pr list',
  'pr view',
  'pr status',
  'pr diff',
  'pr checks',
  'release list',
  'release view',
  'workflow list',
  'workflow view',
  'run list',
  'run view',
  'api user',
  'api repos',
  'config list',
  'config get',
  'status',
  'version',
  'help'
];

/**
 * Execute GitHub CLI commands safely
 */
export async function executeGitHubCommand(commandString: string): Promise<CLIResult> {
  const { command, args } = parseCommand(commandString);
  
  // Must start with gh
  if (command !== 'gh') {
    return {
      success: false,
      output: '',
      error: 'Command must start with "gh"',
      exitCode: 1
    };
  }

  // Check if it's a safe subcommand
  const subCommand = args.join(' ');
  const SAFE_SUBCOMMAND_REGEXES = [
    /^auth (status|list)$/,
    /^repo (list|view|clone)$/,
    /^issue (list|view)$/,
    /^pr list$/,
    /^help$/,
    /^version$/
  ];
  const isSafeCommand =
    SAFE_SUBCOMMANDS.includes(subCommand) ||
    SAFE_SUBCOMMAND_REGEXES.some(regex => regex.test(subCommand));

  if (!isSafeCommand) {
    return {
      success: false,
      output: '',
      error: `Subcommand "${subCommand}" is not allowed. Use "gh help" to see available commands.`,
      exitCode: 1
    };
  }

  // Execute the command
  return executeCommand({
    command: 'gh',
    args,
    allowedCommands: ['gh'],
    timeout: 30000
  });
}

/**
 * Get GitHub CLI help information
 */
export function getGitHubCliHelp(): string {
  return `GitHub CLI Commands (Safe Mode):

Authentication:
  gh auth status               - Show authentication status
  gh auth list                 - List authenticated accounts

Repositories:
  gh repo list                 - List repositories
  gh repo view [repo]          - View repository details
  gh repo clone <repo>         - Clone repository

Issues:
  gh issue list                - List issues
  gh issue view <number>       - View issue details

Pull Requests:
  gh pr list                   - List pull requests
  gh pr view <number>          - View pull request details
  gh pr status                 - Show status of relevant PRs
  gh pr diff <number>          - Show PR diff
  gh pr checks <number>        - Show PR checks

Releases:
  gh release list              - List releases
  gh release view <tag>        - View release details

Workflows:
  gh workflow list             - List workflows
  gh workflow view <workflow>  - View workflow details
  gh run list                  - List workflow runs
  gh run view <id>             - View workflow run details

API:
  gh api user                  - Get authenticated user
  gh api repos                 - List repositories via API

Configuration:
  gh config list               - List configuration
  gh config get <key>          - Get configuration value

General:
  gh status                    - Show status across repos
  gh version                   - Show GitHub CLI version
  gh help                      - Show detailed help

Note: Only read-only commands are allowed for security.`;
}