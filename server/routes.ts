import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./githubAuth";
import "./types"; // Load Express type augmentations

// Import consolidated rate limiting
import { 
  generalApiLimiter, 
  githubApiLimiter, 
  authLimiter, 
  webhookLimiter,
  requireSignature 
} from "./security/rateLimiting";
import { validateEnvironment } from "./environment";

const env = validateEnvironment();

import { 
  generateCodeCompletion, 
  analyzeCode, 
  generateDocumentation, 
  explainCode, 
  generateTests, 
  refactorCode 
} from "./gemini";
import { GitHubService } from "./github";
import aiRoutes from "./routes/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Health check endpoint (no rate limiting needed)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // AI routes (uses its own rate limiting)
  app.use('/api/ai', aiRoutes);

  // Auth routes (with strict rate limiting)
  app.get('/api/auth/user', isAuthenticated, authLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Repository routes (with general rate limiting)
  app.get('/api/repositories', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const repositories = await storage.getUserRepositories(userId);
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.get('/api/repositories/:id', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }
      
      res.json(repository);
    } catch (error) {
      console.error("Error fetching repository:", error);
      res.status(500).json({ message: "Failed to fetch repository" });
    }
  });

  app.post('/api/repositories/sync', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const githubRepos = await github.getUserRepositories();
      
      const syncedRepos = [];
      for (const githubRepo of githubRepos) {
        const repoData = {
          userId,
          githubId: githubRepo.id.toString(),
          name: githubRepo.name,
          fullName: githubRepo.full_name,
          description: githubRepo.description,
          private: githubRepo.private,
          defaultBranch: githubRepo.default_branch,
          cloneUrl: githubRepo.clone_url,
          lastSyncAt: new Date(),
        };
        
        // Check if repository already exists
        const existingRepos = await storage.getUserRepositories(userId);
        const existingRepo = existingRepos.find(r => r.githubId === githubRepo.id.toString());
        
        if (existingRepo) {
          const updated = await storage.updateRepository(existingRepo.id, repoData);
          syncedRepos.push(updated);
        } else {
          const created = await storage.createRepository(repoData);
          syncedRepos.push(created);
        }
      }
      
      res.json(syncedRepos);
    } catch (error) {
      console.error("Error syncing repositories:", error);
      res.status(500).json({ message: "Failed to sync repositories" });
    }
  });

  // File routes (with general rate limiting)
  app.get('/api/repositories/:id/files', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const files = await storage.getRepositoryFiles(id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post('/api/repositories/:id/files/sync', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { path = "" } = req.body;
      
      const repository = await storage.getRepository(id);
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const [owner, repo] = repository.fullName.split('/');
      
      const contents = await github.getRepositoryContents(owner, repo, path);
      const syncedFiles = [];
      
      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (item.type === "file") {
            const fileContent = await github.getFileContent(owner, repo, item.path);
            
            const existingFile = await storage.getFileByPath(repository.id, item.path);
            const fileData = {
              repositoryId: repository.id,
              path: item.path,
              content: fileContent.content,
              sha: fileContent.sha,
              size: fileContent.size.toString(),
              lastModified: new Date(),
            };
            
            if (existingFile) {
              const updated = await storage.updateFile(existingFile.id, fileData);
              syncedFiles.push(updated);
            } else {
              const created = await storage.createFile(fileData);
              syncedFiles.push(created);
            }
          }
        }
      }
      
      res.json(syncedFiles);
    } catch (error) {
      console.error("Error syncing files:", error);
      res.status(500).json({ message: "Failed to sync files" });
    }
  });

  app.put('/api/files/:id', isAuthenticated, generalApiLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const updatedFile = await storage.updateFile(id, {
        content,
        lastModified: new Date(),
      });
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // Gemini AI endpoints (with general rate limiting)
  app.post("/api/ai/code-completion", isAuthenticated, generalApiLimiter, async (req, res) => {
    try {
      const { code, language, cursorPosition } = req.body;
      const suggestions = await generateCodeCompletion(code, language, cursorPosition);
      res.json({ suggestions });
    } catch (error) {
      console.error("Code completion error:", error);
      res.status(500).json({ message: "Code completion failed" });
    }
  });

  app.post("/api/ai/analyze-code", isAuthenticated, async (req, res) => {
    try {
      const { code, language } = req.body;
      const analysis = await analyzeCode(code, language);
      res.json(analysis);
    } catch (error) {
      console.error("Code analysis error:", error);
      res.status(500).json({ message: "Code analysis failed" });
    }
  });

  app.post("/api/ai/generate-docs", isAuthenticated, async (req, res) => {
    try {
      const { code, language } = req.body;
      const documentation = await generateDocumentation(code, language);
      res.json({ documentation });
    } catch (error) {
      console.error("Documentation generation error:", error);
      res.status(500).json({ message: "Documentation generation failed" });
    }
  });

  app.post("/api/ai/explain-code", isAuthenticated, async (req, res) => {
    try {
      const { code, language } = req.body;
      const explanation = await explainCode(code, language);
      res.json({ explanation });
    } catch (error) {
      console.error("Code explanation error:", error);
      res.status(500).json({ message: "Code explanation failed" });
    }
  });

  app.post("/api/ai/generate-tests", isAuthenticated, async (req, res) => {
    try {
      const { code, language } = req.body;
      const tests = await generateTests(code, language);
      res.json({ tests });
    } catch (error) {
      console.error("Test generation error:", error);
      res.status(500).json({ message: "Test generation failed" });
    }
  });

  // Enhanced Copilot features
  app.post("/api/ai/code-suggestions", isAuthenticated, async (req, res) => {
    try {
      const { code, language, fileName, cursorPosition, selectedText } = req.body;
      
      const suggestions = [];
      
      // Generate code completion suggestion
      if (code.trim()) {
        try {
          const completion = await generateCodeCompletion(code, language, cursorPosition || { line: 1, column: 1 });
          if (completion) {
            suggestions.push({
              id: `completion-${Date.now()}`,
              type: 'completion',
              title: 'Code Completion',
              description: 'AI-suggested code completion',
              code: completion,
              confidence: 0.85
            });
          }
        } catch (error) {
          console.error("Completion suggestion error:", error);
        }

        // Generate refactoring suggestion
        try {
          const refactored = await refactorCode(code, language, 'improve readability and performance');
          if (refactored && refactored !== code) {
            suggestions.push({
              id: `refactor-${Date.now()}`,
              type: 'refactor',
              title: 'Code Refactoring',
              description: 'Improve code structure and readability',
              code: refactored,
              confidence: 0.75
            });
          }
        } catch (error) {
          console.error("Refactor suggestion error:", error);
        }

        // Analyze for potential issues
        try {
          const analysis = await analyzeCode(code, language);
          if (analysis.issues && analysis.issues.length > 0) {
            suggestions.push({
              id: `fix-${Date.now()}`,
              type: 'fix',
              title: 'Bug Fix',
              description: `Found ${analysis.issues.length} potential issues`,
              code: `// Issues found:\n${analysis.issues.map((issue) => `// - Line ${issue.line}: ${issue.message}`).join('\n')}\n\n${code}`,
              confidence: 0.70
            });
          }
        } catch (error) {
          console.error("Analysis suggestion error:", error);
        }
      }
      
      res.json({ suggestions });
    } catch (error) {
      console.error("Code suggestions error:", error);
      res.status(500).json({ error: "Failed to generate code suggestions" });
    }
  });

  app.post("/api/ai/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, code, language, fileName, history } = req.body;
      
      const context = `
You are an expert programming assistant. The user is working on a ${language} file named ${fileName || 'untitled'}.

Current code:
\`\`\`${language}
${code}
\`\`\`

Chat history:
${history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User question: ${message}

Provide a helpful, accurate response about the code or programming question.
`;
      
      const response = await explainCode(context, language);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.post("/api/ai/refactor-code", isAuthenticated, async (req, res) => {
    try {
      const { code, language, instructions } = req.body;
      const refactoredCode = await refactorCode(code, language, instructions);
      res.json({ refactoredCode });
    } catch (error) {
      console.error("Code refactoring error:", error);
      res.status(500).json({ message: "Code refactoring failed" });
    }
  });

  // Enhanced GitHub API endpoints
  app.get("/api/github/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const githubUser = await github.getUser();
      res.json(githubUser);
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
      res.status(500).json({ message: "Failed to fetch GitHub user" });
    }
  });

  app.get("/api/github/:owner/:repo/pulls", isAuthenticated, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { state = 'open' } = req.query;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const pullRequests = await github.getPullRequests(owner, repo, state);
      res.json(pullRequests);
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      res.status(500).json({ message: "Failed to fetch pull requests" });
    }
  });

  app.get("/api/github/:owner/:repo/issues", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { state = 'open' } = req.query;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const issues = await github.getIssues(owner, repo, state);
      res.json(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.get("/api/github/:owner/:repo/releases", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const releases = await github.getReleases(owner, repo);
      res.json(releases);
    } catch (error) {
      console.error("Error fetching releases:", error);
      res.status(500).json({ message: "Failed to fetch releases" });
    }
  });

  app.get("/api/github/:owner/:repo/stats", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const stats = await github.getRepositoryStats(owner, repo);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching repository stats:", error);
      res.status(500).json({ message: "Failed to fetch repository stats" });
    }
  });

  app.post("/api/github/:owner/:repo/branches", isAuthenticated, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { branchName, fromBranch } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const branch = await github.createBranch(owner, repo, branchName, fromBranch);
      res.json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  app.post("/api/github/:owner/:repo/pulls", isAuthenticated, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { title, body, head, base } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const pullRequest = await github.createPullRequest(owner, repo, title, body, head, base);
      res.json(pullRequest);
    } catch (error) {
      console.error("Error creating pull request:", error);
      res.status(500).json({ message: "Failed to create pull request" });
    }
  });

  app.post("/api/github/:owner/:repo/issues", isAuthenticated, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { title, body, labels } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const issue = await github.createIssue(owner, repo, title, body, labels);
      res.json(issue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(500).json({ message: "Failed to create issue" });
    }
  });

  app.get("/api/github/search/repositories", isAuthenticated, async (req: any, res) => {
    try {
      const { q, sort } = req.query;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const repositories = await github.searchRepositories(q, sort);
      res.json(repositories);
    } catch (error) {
      console.error("Error searching repositories:", error);
      res.status(500).json({ message: "Failed to search repositories" });
    }
  });

  // Get repository commits
  app.get("/api/github/:owner/:repo/commits", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const { sha } = req.query;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const commits = await github.getCommits(owner, repo, sha);
      res.json(commits);
    } catch (error) {
      console.error("Error fetching commits:", error);
      res.status(500).json({ message: "Failed to fetch commits" });
    }
  });

  // Get repository branches  
  app.get("/api/github/:owner/:repo/branches", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      const branches = await github.getBranches(owner, repo);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Get file content from repository
  app.get("/api/github/:owner/:repo/contents/*", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const path = req.params[0] || "";
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      const github = new GitHubService(user.githubAccessToken);
      
      if (path) {
        // Get specific file content
        const fileContent = await github.getFileContent(owner, repo, path);
        res.json(fileContent);
      } else {
        // Get repository contents (directory listing)
        const contents = await github.getRepositoryContents(owner, repo);
        res.json(contents);
      }
    } catch (error) {
      console.error("Error fetching repository contents:", error);
      res.status(500).json({ message: "Failed to fetch repository contents" });
    }
  });

  // Update file in repository
  app.put("/api/github/:owner/:repo/contents/*", isAuthenticated, githubApiLimiter, async (req: any, res) => {
    try {
      const { owner, repo } = req.params;
      const path = req.params[0];
      const { content, message, sha } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.githubAccessToken) {
        return res.status(400).json({ message: "GitHub access token not found" });
      }

      if (!path || !content || !message) {
        return res.status(400).json({ message: "Path, content, and commit message are required" });
      }

      const github = new GitHubService(user.githubAccessToken);
      
      if (sha) {
        // Update existing file
        const result = await github.updateFile(owner, repo, path, content, sha, message);
        res.json(result);
      } else {
        // Create new file
        const result = await github.createFile(owner, repo, path, content, message);
        res.json(result);
      }
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // Webhook endpoints with SHA verification
  if (env.WEBHOOK_SECRET) {
    app.post('/api/webhooks/github', 
      webhookLimiter,
      requireSignature(env.WEBHOOK_SECRET),
      async (req, res) => {
        try {
          const { action, repository, sender } = req.body;
          
          console.log('GitHub webhook received:', {
            action,
            repo: repository?.full_name,
            sender: sender?.login
          });
          
          // Process webhook event
          if (action === 'push' || action === 'pull_request') {
            // Handle repository updates
            // This is where you'd sync repository data, trigger builds, etc.
          }
          
          res.json({ message: 'Webhook processed successfully' });
        } catch (error) {
          console.error('Webhook processing error:', error);
          res.status(500).json({ message: 'Failed to process webhook' });
        }
      }
    );
  }

  // Secure API endpoints that require signature verification
  if (env.API_SECRET) {
    app.post('/api/secure/deploy',
      isAuthenticated,
      generalApiLimiter,
      requireSignature(env.API_SECRET),
      async (req, res) => {
        try {
          // This would handle secure deployment operations
          const { repository, branch, environment } = req.body;
          
          console.log('Secure deployment request:', {
            repository,
            branch,
            environment,
            user: req.user?.id
          });
          
          res.json({ message: 'Deployment initiated', status: 'pending' });
        } catch (error) {
          console.error('Deployment error:', error);
          res.status(500).json({ message: 'Deployment failed' });
        }
      }
    );
  }

  const httpServer = createServer(app);
  
  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast to all clients except sender
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
