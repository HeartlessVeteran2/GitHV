import { spawn, exec } from 'child_process';
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

  // Sanitize arguments to prevent command injection
  const sanitizedArgs = args.map(arg => {
    // Remove potentially dangerous characters
    return arg.replace(/[;&|`$(){}[\]<>]/g, '');
  });

  try {
    const fullCommand = `${command} ${sanitizedArgs.join(' ')}`;
    
    // Execute with timeout
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    return {
      success: true,
      output: stdout || stderr || 'Command executed successfully',
      exitCode: 0
    };
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message || 'Command execution failed',
      exitCode: error.code || 1
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