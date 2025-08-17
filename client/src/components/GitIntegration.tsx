import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  GitBranch, GitCommit, GitPullRequest, GitMerge,
  RefreshCw, Plus, Check, X, Clock, AlertCircle,
  ChevronRight, Download, Upload, History
} from "lucide-react";

interface GitChange {
  file: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: Date;
  branch: string;
}

interface GitBranch {
  name: string;
  isActive: boolean;
  lastCommit: Date;
  ahead: number;
  behind: number;
}

export default function GitIntegration() {
  const [currentBranch, setCurrentBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Mock data for demonstration
  const [changes] = useState<GitChange[]>([
    { file: "src/App.tsx", status: "modified", additions: 45, deletions: 12 },
    { file: "src/components/Header.tsx", status: "added", additions: 78, deletions: 0 },
    { file: "src/old-file.js", status: "deleted", additions: 0, deletions: 156 },
    { file: "README.md", status: "modified", additions: 23, deletions: 5 }
  ]);
  
  const [commits] = useState<GitCommit[]>([
    {
      id: "abc123",
      message: "Add mobile optimization features",
      author: "You",
      date: new Date(Date.now() - 3600000),
      branch: "main"
    },
    {
      id: "def456",
      message: "Fix responsive layout issues",
      author: "You",
      date: new Date(Date.now() - 7200000),
      branch: "main"
    },
    {
      id: "ghi789",
      message: "Initial commit",
      author: "You",
      date: new Date(Date.now() - 86400000),
      branch: "main"
    }
  ]);
  
  const [branches] = useState<GitBranch[]>([
    { name: "main", isActive: true, lastCommit: new Date(), ahead: 0, behind: 0 },
    { name: "feature/mobile-ui", isActive: false, lastCommit: new Date(Date.now() - 3600000), ahead: 3, behind: 1 },
    { name: "fix/terminal-bug", isActive: false, lastCommit: new Date(Date.now() - 7200000), ahead: 1, behind: 0 }
  ]);

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a commit message",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to commit",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Changes Committed",
      description: `Committed ${selectedFiles.length} files: "${commitMessage}"`
    });
    
    setCommitMessage("");
    setSelectedFiles([]);
  };

  const handlePush = () => {
    toast({
      title: "Pushing Changes",
      description: "Pushing to origin/main..."
    });
    
    setTimeout(() => {
      toast({
        title: "Push Complete",
        description: "Successfully pushed to remote repository"
      });
    }, 2000);
  };

  const handlePull = () => {
    toast({
      title: "Pulling Changes",
      description: "Pulling from origin/main..."
    });
    
    setTimeout(() => {
      toast({
        title: "Pull Complete",
        description: "Your branch is up to date"
      });
    }, 2000);
  };

  const switchBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    toast({
      title: "Branch Switched",
      description: `Switched to branch: ${branchName}`
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="h-3 w-3 text-green-500" />;
      case 'modified':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'deleted':
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const toggleFileSelection = (file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <Tabs defaultValue="changes" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 rounded-none">
          <TabsTrigger value="changes" className="text-xs">
            <GitCommit className="h-3 w-3 mr-1" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History className="h-3 w-3 mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="branches" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            Branches
          </TabsTrigger>
        </TabsList>

        {/* Changes Tab */}
        <TabsContent value="changes" className="flex-1 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">{currentBranch}</span>
              <Badge variant="outline" className="text-xs">
                {changes.length} changes
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={handlePull}>
                <Download className="h-3 w-3 mr-1" />
                Pull
              </Button>
              <Button size="sm" variant="ghost" onClick={handlePush}>
                <Upload className="h-3 w-3 mr-1" />
                Push
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-2">
              {changes.map((change) => (
                <div
                  key={change.file}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-700 cursor-pointer"
                  onClick={() => toggleFileSelection(change.file)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(change.file)}
                      onChange={() => {}}
                      className="rounded border-gray-600"
                    />
                    {getStatusIcon(change.status)}
                    <div>
                      <div className="text-sm">{change.file}</div>
                      <div className="text-xs text-gray-400">
                        +{change.additions} -{change.deletions}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {change.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-3">
            <Input
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="bg-gray-900 border-gray-700"
            />
            
            <div className="flex items-center space-x-2">
              <Button
                className="flex-1"
                onClick={handleCommit}
                disabled={selectedFiles.length === 0 || !commitMessage}
              >
                <GitCommit className="h-4 w-4 mr-2" />
                Commit {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setSelectedFiles(changes.map(c => c.file))}
              >
                Select All
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {commits.map((commit) => (
                <div key={commit.id} className="p-3 rounded bg-gray-900 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GitCommit className="h-4 w-4 text-blue-400" />
                      <code className="text-xs text-gray-400">{commit.id}</code>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {commit.branch}
                    </Badge>
                  </div>
                  
                  <div className="text-sm mb-2">{commit.message}</div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{commit.author}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(commit.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="flex-1 p-4">
          <div className="mb-4">
            <Button size="sm" className="w-full">
              <Plus className="h-3 w-3 mr-2" />
              Create Branch
            </Button>
          </div>
          
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`p-3 rounded cursor-pointer ${
                    branch.isActive ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-900 border border-gray-700'
                  }`}
                  onClick={() => !branch.isActive && switchBranch(branch.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GitBranch className={`h-4 w-4 ${branch.isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{branch.name}</span>
                      {branch.isActive && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    {!branch.isActive && (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(branch.lastCommit).toLocaleDateString()}</span>
                    </div>
                    
                    {(branch.ahead > 0 || branch.behind > 0) && (
                      <div className="flex items-center space-x-2">
                        {branch.ahead > 0 && (
                          <span className="text-green-400">↑{branch.ahead}</span>
                        )}
                        {branch.behind > 0 && (
                          <span className="text-red-400">↓{branch.behind}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}