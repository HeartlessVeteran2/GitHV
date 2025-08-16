import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Clock, 
  User, 
  MessageSquare,
  Plus,
  Minus
} from "lucide-react";

interface GitCommit {
  id: string;
  sha: string;
  message: string;
  author: string;
  date: Date;
  branch: string;
  parents: string[];
  additions: number;
  deletions: number;
}

interface GitBranch {
  name: string;
  lastCommit: string;
  ahead: number;
  behind: number;
  isActive: boolean;
}

interface GitVisualizationProps {
  repository: any;
  onBranchSwitch: (branch: string) => void;
  onCommitSelect: (commit: GitCommit) => void;
}

export default function GitVisualization({ 
  repository, 
  onBranchSwitch, 
  onCommitSelect 
}: GitVisualizationProps) {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data - in real implementation, this would come from GitHub API
  useEffect(() => {
    const mockCommits: GitCommit[] = [
      {
        id: "1",
        sha: "a1b2c3d",
        message: "Add authentication system",
        author: "John Doe",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        branch: "main",
        parents: ["2"],
        additions: 45,
        deletions: 12
      },
      {
        id: "2", 
        sha: "b2c3d4e",
        message: "Implement file upload feature",
        author: "Jane Smith",
        date: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        branch: "main",
        parents: ["3"],
        additions: 23,
        deletions: 5
      },
      {
        id: "3",
        sha: "c3d4e5f", 
        message: "Fix responsive design issues",
        author: "Bob Wilson",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        branch: "main",
        parents: ["4"],
        additions: 15,
        deletions: 8
      },
      {
        id: "4",
        sha: "d4e5f6g",
        message: "Add dark mode support",
        author: "Alice Johnson", 
        date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        branch: "feature/dark-mode",
        parents: ["5"],
        additions: 67,
        deletions: 21
      }
    ];

    const mockBranches: GitBranch[] = [
      { name: "main", lastCommit: "a1b2c3d", ahead: 0, behind: 0, isActive: true },
      { name: "feature/auth", lastCommit: "x1y2z3a", ahead: 2, behind: 1, isActive: false },
      { name: "feature/ui-improvements", lastCommit: "p1q2r3s", ahead: 1, behind: 3, isActive: false }
    ];

    setCommits(mockCommits);
    setBranches(mockBranches);
  }, [repository]);

  const drawCommitGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw commit history visualization
    const commitHeight = 60;
    const branchWidth = 30;
    
    commits.forEach((commit, index) => {
      const y = index * commitHeight + 30;
      const x = 40;

      // Draw commit node
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = commit.branch === "main" ? "#2563eb" : "#16a34a";
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw connection line to previous commit
      if (index < commits.length - 1) {
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x, y + commitHeight - 8);
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw branch indicator
      if (commit.branch !== "main") {
        ctx.beginPath();
        ctx.arc(x + branchWidth, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#16a34a";
        ctx.fill();
        
        // Connect to main branch
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + branchWidth - 6, y);
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    drawCommitGraph();
  }, [commits]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitCommit className="h-5 w-5" />
                <span>Commit History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {commits.map((commit) => (
                    <div
                      key={commit.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCommit === commit.id 
                          ? "border-github-blue bg-github-blue/10" 
                          : "border-dark-border hover:border-gray-600"
                      }`}
                      onClick={() => {
                        setSelectedCommit(commit.id);
                        onCommitSelect(commit);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            {commit.message}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{commit.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(commit.date)}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {commit.branch}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="flex items-center space-x-1 text-green-400">
                            <Plus className="h-3 w-3" />
                            <span>{commit.additions}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-red-400">
                            <Minus className="h-3 w-3" />
                            <span>{commit.deletions}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 font-mono text-xs text-gray-500">
                        {commit.sha}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5" />
                <span>Branches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-dark-border hover:border-gray-600 cursor-pointer"
                    onClick={() => onBranchSwitch(branch.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <GitBranch className={`h-4 w-4 ${branch.isActive ? "text-green-400" : "text-gray-400"}`} />
                      <div>
                        <div className="font-medium text-sm">
                          {branch.name}
                          {branch.isActive && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {branch.lastCommit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {branch.ahead > 0 && (
                        <Badge variant="outline" className="text-green-400">
                          +{branch.ahead}
                        </Badge>
                      )}
                      {branch.behind > 0 && (
                        <Badge variant="outline" className="text-red-400">
                          -{branch.behind}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {/* Create new branch */}}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create New Branch
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitMerge className="h-5 w-5" />
                <span>Commit Graph</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={400}
                  className="border border-dark-border rounded"
                />
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>main</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>feature</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}