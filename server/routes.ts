import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { GitHubService } from "./github";
import { insertRepositorySchema, insertFileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Repository routes
  app.get('/api/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const repositories = await storage.getUserRepositories(userId);
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  app.get('/api/repositories/:id', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/repositories/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // File routes
  app.get('/api/repositories/:id/files', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const files = await storage.getRepositoryFiles(id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/repositories/:id/files/sync', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { path = "" } = req.body;
      
      const repository = await storage.getRepository(id);
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }

      const userId = req.user.claims.sub;
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

  app.put('/api/files/:id', isAuthenticated, async (req: any, res) => {
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
