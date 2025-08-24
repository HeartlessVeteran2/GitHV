import { executeCommand, CLIResult, parseCommand } from './base';

// Allowed gcloud commands for security
const ALLOWED_GCLOUD_COMMANDS = [
  'gcloud',
  'version',
  'auth',
  'config',
  'projects',
  'compute',
  'storage',
  'functions',
  'app',
  'sql',
  'container',
  'iam',
  'logging',
  'monitoring'
];

// Safe gcloud subcommands
const SAFE_SUBCOMMANDS = [
  'list',
  'describe',
  'get',
  'show',
  'info',
  'version',
  'help',
  'config list',
  'config get-value',
  'auth list',
  'projects list',
  'compute instances list',
  'compute zones list',
  'compute regions list',
  'storage buckets list',
  'functions list',
  'app services list',
  'sql instances list',
  'container clusters list',
  'iam service-accounts list',
  'logging logs list'
];

/**
 * Execute gcloud CLI commands safely
 */
export async function executeGcloudCommand(commandString: string): Promise<CLIResult> {
  const { command, args } = parseCommand(commandString);
  
  // Must start with gcloud
  if (command !== 'gcloud') {
    return {
      success: false,
      output: '',
      error: 'Command must start with "gcloud"',
      exitCode: 1
    };
  }

  // Check if it's a safe subcommand
  const subCommand = args.join(' ');
  const isSafeCommand = SAFE_SUBCOMMANDS.some(safe => 
    subCommand.startsWith(safe) || subCommand === 'help' || subCommand === 'version'
  );

  if (!isSafeCommand) {
    return {
      success: false,
      output: '',
      error: `Subcommand "${subCommand}" is not allowed. Use "gcloud help" to see available commands.`,
      exitCode: 1
    };
  }

  // Execute the command
  return executeCommand({
    command: 'gcloud',
    args,
    allowedCommands: ['gcloud'],
    timeout: 45000 // Longer timeout for gcloud commands
  });
}

/**
 * Get gcloud help information
 */
export function getGcloudHelp(): string {
  return `Google Cloud CLI Commands (Safe Mode):

Authentication:
  gcloud auth list              - List authenticated accounts
  gcloud config list            - Show current configuration
  gcloud config get-value project - Get current project

Projects:
  gcloud projects list          - List accessible projects

Compute:
  gcloud compute instances list - List VM instances
  gcloud compute zones list     - List available zones
  gcloud compute regions list   - List available regions

Storage:
  gcloud storage buckets list   - List storage buckets

Functions:
  gcloud functions list         - List cloud functions

App Engine:
  gcloud app services list      - List App Engine services

Cloud SQL:
  gcloud sql instances list     - List SQL instances

Container:
  gcloud container clusters list - List GKE clusters

IAM:
  gcloud iam service-accounts list - List service accounts

Logging:
  gcloud logging logs list      - List available logs

General:
  gcloud version               - Show gcloud version
  gcloud help                  - Show detailed help

Note: Only read-only commands are allowed for security.`;
}