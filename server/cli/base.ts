import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CLIResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

export interface CLICommand {
  command: string;
  args: string[];
  allowedCommands: string[];
  timeout?: number;
}

/**
 * Securely execute CLI commands with whitelist filtering
 */
export async function executeCommand({
  command,
  args,
  allowedCommands,
  timeout = 30000
}: CLICommand): Promise<CLIResult> {
  // Security check: ensure command is in whitelist
  if (!allowedCommands.includes(command)) {
    return {
      success: false,
      output: '',
      error: `Command '${command}' is not allowed`,
      exitCode: 1
    };
  }

  // Validate arguments: ensure all are strings and not empty
  const validatedArgs = args.filter(arg => typeof arg === 'string' && arg.length > 0);

  try {
    // Execute command securely without shell
    const { stdout, stderr, code } = await spawnAsync(command, validatedArgs, {
      timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    return {
      success: true,
      output: stdout || stderr || 'Command executed successfully',
      exitCode: 0
    };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number };
    return {
      success: false,
      output: '',
      error: err.message || 'Command execution failed',
      exitCode: err.code || 1
    };
  }
}

/**
 * Parse command string into command and arguments
 */
export function parseCommand(commandString: string): { command: string; args: string[] } {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  
  return { command, args };
}

/**
 * Format CLI output for terminal display
 */
export function formatOutput(result: CLIResult): string {
  if (!result.success) {
    return `Error: ${result.error}`;
  }
  return result.output;
}