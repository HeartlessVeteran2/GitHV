import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Menu, Code, GitBranch, Star, GitPullRequest, Issues, Search,
  Home, Bell, Plus, User, Settings, LogOut, Clock, Eye,
  GitCommit, GitMerge, Users, Book, Package, Shield,
  Activity, TrendingUp, Zap, FolderOpen, FileText, ChevronRight,
  MoreVertical, Heart, MessageSquare, Share2, BookOpen, X, RefreshCw
} from "lucide-react";
import EnhancedMonacoEditor from "./EnhancedMonacoEditor";
import type { Repository, File as FileType } from "@shared/schema";

export default function GitHubMobileLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [createRepoOpen, setCreateRepoOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDescription, setRepoDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Fetch repositories
  const { data: repositories = [] } = useQuery<Repository[]>({
    queryKey: ['/api/repositories'],
    enabled: isAuthenticated
  });
  
  // Fetch files for selected repository
  const { data: files = [] } = useQuery<FileType[]>({
    queryKey: ['/api/repositories', selectedRepo?.id, 'files'],
    enabled: !!selectedRepo
  });

  // GitHub-style navigation items
  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "repositories", label: "Repositories", icon: Book },
    { id: "pull-requests", label: "Pull Requests", icon: GitPullRequest },
    { id: "issues", label: "Issues", icon: Issues },
    { id: "explore", label: "Explore", icon: TrendingUp },
    { id: "marketplace", label: "Marketplace", icon: Package },
  ];

  // Sync repositories mutation
  const syncReposMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/repositories/sync");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      toast({
        title: "Success",
        description: "Repositories synced successfully",
      });
    },
  });

  // Sync files mutation
  const syncFilesMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return apiRequest("POST", `/api/repositories/${repositoryId}/files/sync`);
    },
    onSuccess: () => {
      if (selectedRepo) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/repositories", selectedRepo.id, "files"] 
        });
      }
      toast({
        title: "Success",
        description: "Files synced successfully",
      });
    },
  });

  const handleRepoClick = (repo: Repository) => {
    setSelectedRepo(repo);
    setActiveTab("repo-detail");
    syncFilesMutation.mutate(repo.id);
  };

  const handleFileClick = (file: FileType) => {
    setSelectedFile(file);
    setCodeEditorOpen(true);
  };

  const handleCreateRepo = () => {
    setCreateRepoOpen(true);
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 text-white mb-4 animate-pulse mx-auto" />
          <p className="text-gray-400">Loading GitHub Mobile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gray-900 border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-white flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user?.email}</span>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full mt-6">
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === item.id 
                            ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400" 
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-800 mt-4 pt-4">
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-white" />
              <span className="font-bold text-lg">GitHub</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search repositories, code, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === "home" && (
          <div className="p-4 space-y-4">
            {/* Activity Feed */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Activity className="h-5 w-5 text-blue-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "starred", repo: "facebook/react", time: "2 hours ago", icon: Star },
                  { action: "forked", repo: "vercel/next.js", time: "5 hours ago", icon: GitBranch },
                  { action: "opened PR", repo: "microsoft/vscode", time: "1 day ago", icon: GitPullRequest },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <activity.icon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">You {activity.action}</p>
                        <p className="text-xs text-blue-400">{activity.repo}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Repositories */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Trending Today</span>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "shadcn/ui", desc: "Beautifully designed components", stars: "45.2k", lang: "TypeScript" },
                  { name: "openai/gpt-4", desc: "Latest AI model", stars: "28.1k", lang: "Python" },
                  { name: "stripe/stripe-js", desc: "Payment processing", stars: "12.3k", lang: "JavaScript" },
                ].map((repo, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-400">{repo.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{repo.desc}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge className="bg-gray-700 text-gray-300">{repo.lang}</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-400">{repo.stars}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "repositories" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Repositories</h2>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                  onClick={() => syncReposMutation.mutate()}
                  disabled={syncReposMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncReposMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleCreateRepo}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {repositories.map((repo) => (
                <Card 
                  key={repo.id} 
                  className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-all"
                  onClick={() => handleRepoClick(repo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Book className="h-4 w-4 text-gray-400" />
                          <h3 className="font-semibold text-blue-400">{repo.name}</h3>
                          {repo.private && (
                            <Badge className="bg-gray-700 text-gray-300 text-xs">Private</Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="text-xs text-gray-400">JavaScript</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">0</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitBranch className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">0</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "repo-detail" && selectedRepo && (
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Book className="h-5 w-5 text-gray-400" />
                <h1 className="text-xl font-bold text-white">{selectedRepo.name}</h1>
                {selectedRepo.private && (
                  <Badge className="bg-gray-700 text-gray-300">Private</Badge>
                )}
              </div>
              {selectedRepo.description && (
                <p className="text-sm text-gray-400">{selectedRepo.description}</p>
              )}
            </div>

            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="prs">PRs</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{selectedRepo.defaultBranch || 'main'}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-gray-300 border-gray-700">
                        Clone
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {files.length > 0 ? (
                        files.slice(0, 10).map((file) => (
                          <div 
                            key={file.id} 
                            onClick={() => handleFileClick(file)}
                            className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{file.path.split('/').pop()}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-2">No files synced yet</p>
                          <Button 
                            size="sm"
                            onClick={() => syncFilesMutation.mutate(selectedRepo.id)}
                            disabled={syncFilesMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {syncFilesMutation.isPending ? "Syncing..." : "Sync Files"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button className="bg-gray-800 hover:bg-gray-700 text-gray-300">
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </Button>
                  <Button className="bg-gray-800 hover:bg-gray-700 text-gray-300">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Fork
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="issues" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <Issues className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No open issues</p>
                    <Button className="mt-3 bg-green-600 hover:bg-green-700">
                      New Issue
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="prs" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <GitPullRequest className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No open pull requests</p>
                    <Button className="mt-3 bg-green-600 hover:bg-green-700">
                      New Pull Request
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="actions" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No workflow runs</p>
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                      Setup Workflow
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "explore" && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Explore GitHub</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Topics", icon: BookOpen, color: "bg-blue-600" },
                { title: "Trending", icon: TrendingUp, color: "bg-green-600" },
                { title: "Collections", icon: Package, color: "bg-purple-600" },
                { title: "Sponsors", icon: Heart, color: "bg-pink-600" },
              ].map((item) => (
                <Card key={item.title} className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800/50">
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className={`${item.color} p-3 rounded-lg mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-300">{item.title}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
        <div className="grid grid-cols-5 h-16">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "repositories", icon: Book, label: "Repos" },
            { id: "explore", icon: TrendingUp, label: "Explore" },
            { id: "notifications", icon: Bell, label: "Inbox" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 ${
                activeTab === item.id ? "text-blue-400" : "text-gray-400"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Code Editor Dialog */}
      <Dialog open={codeEditorOpen} onOpenChange={setCodeEditorOpen}>
        <DialogContent className="max-w-full h-full m-0 p-0 bg-gray-900">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gray-900/95 backdrop-blur-sm p-4 border-b border-gray-800">
            <DialogTitle className="flex items-center justify-between text-white">
              <span className="text-sm truncate">{selectedFile?.path.split('/').pop()}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCodeEditorOpen(false)}
                className="text-gray-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="h-full pt-16">
            {selectedFile && (
              <EnhancedMonacoEditor
                value={selectedFile.content || ""}
                language="javascript"
                theme="vs-dark"
                onChange={() => {}}
                onSave={() => {
                  toast({
                    title: "File Saved",
                    description: "Changes have been saved successfully"
                  });
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Repository Dialog */}
      <Dialog open={createRepoOpen} onOpenChange={setCreateRepoOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Repository</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new repository on GitHub
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Repository name</label>
              <Input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-awesome-project"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">Description (optional)</label>
              <Textarea
                value={repoDescription}
                onChange={(e) => setRepoDescription(e.target.value)}
                placeholder="A short description of your project"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-700"
              />
              <label htmlFor="private" className="text-sm text-gray-300">
                Make this repository private
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setCreateRepoOpen(false)}
                className="border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Repository Created",
                    description: `${repoName} has been created successfully`
                  });
                  setCreateRepoOpen(false);
                  setRepoName("");
                  setRepoDescription("");
                }}
                disabled={!repoName}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Repository
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}