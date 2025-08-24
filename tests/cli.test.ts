/**
 * CLI Integration Tests
 * Tests the CLI functionality without requiring database or authentication
 */

import { executeGcloudCommand, getGcloudHelp } from '../server/cli/gcloud';
import { executeGitHubCommand, getGitHubCliHelp } from '../server/cli/github';
import { executeGeminiCommand, getGeminiHelp } from '../server/cli/gemini';

describe('CLI Integration', () => {
  describe('gcloud CLI', () => {
    test('should provide help information', () => {
      const help = getGcloudHelp();
      expect(help).toContain('Google Cloud CLI Commands');
      expect(help).toContain('gcloud projects list');
      expect(help).toContain('Only read-only commands are allowed');
    });

    test('should allow safe gcloud commands', async () => {
      const result = await executeGcloudCommand('gcloud version');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Google Cloud SDK');
    });

    test('should reject unsafe gcloud commands', async () => {
      const result = await executeGcloudCommand('gcloud compute instances delete test-instance');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    test('should reject non-gcloud commands', async () => {
      const result = await executeGcloudCommand('rm -rf /');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must start with "gcloud"');
    });
  });

  describe('GitHub CLI', () => {
    test('should provide help information', () => {
      const help = getGitHubCliHelp();
      expect(help).toContain('GitHub CLI Commands');
      expect(help).toContain('gh repo list');
      expect(help).toContain('Only read-only commands are allowed');
    });

    test('should allow safe gh commands', async () => {
      const result = await executeGitHubCommand('gh version');
      expect(result.success).toBe(true);
      expect(result.output).toContain('gh version');
    });

    test('should reject unsafe gh commands', async () => {
      const result = await executeGitHubCommand('gh repo delete dangerous-repo');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    test('should reject non-gh commands', async () => {
      const result = await executeGitHubCommand('curl http://malicious.com');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must start with "gh"');
    });
  });

  describe('Gemini CLI', () => {
    test('should provide help information', () => {
      const help = getGeminiHelp();
      expect(help).toContain('Gemini AI CLI Commands');
      expect(help).toContain('gemini explain');
      expect(help).toContain('gemini test');
    });

    test('should handle help command', async () => {
      const result = await executeGeminiCommand('gemini help');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Gemini AI CLI Commands');
    });

    test('should handle version command', async () => {
      const result = await executeGeminiCommand('gemini version');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Gemini CLI v1.0.0');
    });

    test('should require code context for analysis commands', async () => {
      const result = await executeGeminiCommand('gemini explain');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Code and language are required');
    });

    test('should reject unknown commands', async () => {
      const result = await executeGeminiCommand('gemini malicious-command');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown Gemini command');
    });
  });
});