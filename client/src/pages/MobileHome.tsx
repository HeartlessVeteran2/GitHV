import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// import { useMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileCodeEditor from "@/components/MobileCodeEditor";
import AIPoweredCodeEditor from "@/components/AIPoweredCodeEditor";
import SimpleGitHubDashboard from "@/components/SimpleGitHubDashboard";
import CopilotAssistant from "@/components/CopilotAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, Code, GitBranch, Folder, Settings, User, 
  Smartphone, Tablet, Monitor, Sparkles, Brain,
  FileCode, Terminal, Search, Plus, RefreshCw, LogOut
} from "lucide-react";
import type { Repository, File as FileType } from "@shared/schema";

export default function MobileHome() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // const isMobile = useMobile();
  const isMobile = window.innerWidth < 768;
  
  const [activeView, setActiveView] = useState("editor");
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [copilotMode, setCopilotMode] = useState(true);
  const [deviceMode, setDeviceMode] = useState<'phone' | 'tablet' | 'desktop'>('tablet');

  // Auto-detect device mode
  useEffect(() => {
    const updateDeviceMode = () => {
      const width = window.innerWidth;
      if (width < 640) setDeviceMode('phone');
      else if (width < 1024) setDeviceMode('tablet');
      else setDeviceMode('desktop');
    };

    updateDeviceMode();
    window.addEventListener('resize', updateDeviceMode);
    return () => window.removeEventListener('resize', updateDeviceMode);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: repositories = [] } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: repositoryFiles = [] } = useQuery<FileType[]>({
    queryKey: ["/api/repositories", currentRepository?.id, "files"],
    enabled: !!currentRepository,
    retry: false,
  });

  const syncRepositoriesMutation = useMutation({
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
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      return apiRequest("PUT", `/api/files/${fileId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories", currentRepository?.id, "files"] });
      toast({
        title: "Success",
        description: "File saved successfully",
      });
    },
  });

  const openFile = (file: FileType) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const closeFile = (fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  const handleFileChange = (fileId: string, content: string) => {
    setOpenFiles(prev =>
      prev.map(file =>
        file.id === fileId ? { ...file, content } : file
      )
    );
  };

  const handleSave = () => {
    const activeFile = openFiles.find(f => f.id === activeFileId);
    if (activeFile?.content !== undefined) {
      updateFileMutation.mutate({
        fileId: activeFile.id,
        content: activeFile.content
      });
    }
  };

  const handleRun = () => {
    toast({
      title: "Running Code",
      description: "Code execution started",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading GitHV...</p>
        </div>
      </div>
    );
  }

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Mobile/Tablet Header */}
      <div className="flex items-center justify-between p-4 bg-dark-surface border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-dark-surface border-dark-border">
              <div className="py-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.firstName || 'User'}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Device Mode Selector */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Device Mode</h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant={deviceMode === 'phone' ? 'default' : 'outline'}
                      onClick={() => setDeviceMode('phone')}
                      className="flex-1"
                    >
                      <Smartphone className="h-3 w-3 mr-1" />
                      Phone
                    </Button>
                    <Button
                      size="sm"
                      variant={deviceMode === 'tablet' ? 'default' : 'outline'}
                      onClick={() => setDeviceMode('tablet')}
                      className="flex-1"
                    >
                      <Tablet className="h-3 w-3 mr-1" />
                      Tablet
                    </Button>
                    <Button
                      size="sm"
                      variant={deviceMode === 'desktop' ? 'default' : 'outline'}
                      onClick={() => setDeviceMode('desktop')}
                      className="flex-1"
                    >
                      <Monitor className="h-3 w-3 mr-1" />
                      Desktop
                    </Button>
                  </div>
                </div>

                {/* Repositories */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Repositories</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncRepositoriesMutation.mutate()}
                      disabled={syncRepositoriesMutation.isPending}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {repositories.map((repo) => (
                        <Button
                          key={repo.id}
                          variant={currentRepository?.id === repo.id ? "default" : "ghost"}
                          className="w-full justify-start text-left"
                          onClick={() => setCurrentRepository(repo)}
                        >
                          <GitBranch className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{repo.name}</p>
                            <p className="text-xs text-gray-400 truncate">{repo.fullName}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Files */}
                {repositoryFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white">Files</h3>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {repositoryFiles.slice(0, 10).map((file) => (
                          <Button
                            key={file.id}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => openFile(file)}
                          >
                            <FileCode className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs truncate">{file.path.split('/').pop()}</span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCopilotMode(!copilotMode)}
                      className={copilotMode ? "bg-blue-600 text-white" : ""}
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Copilot
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAiMode(!aiMode)}
                      className={aiMode ? "bg-purple-600 text-white" : ""}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Mode
                    </Button>
                    <Button size="sm" variant="outline">
                      <Terminal className="h-3 w-3 mr-1" />
                      Terminal
                    </Button>
                    <Button size="sm" variant="outline">
                      <Search className="h-3 w-3 mr-1" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Logout */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/api/logout"}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-bold">GitHV</h1>
          <Badge variant="outline" className="text-xs">
            {deviceMode === 'phone' ? 'Mobile' : deviceMode === 'tablet' ? 'Tablet' : 'Desktop'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {copilotMode && (
            <Badge className="bg-blue-600">
              <Brain className="h-3 w-3 mr-1" />
              Copilot
            </Badge>
          )}
          {aiMode && (
            <Badge className="bg-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
          {currentRepository && (
            <Badge variant="outline" className="text-xs">
              {currentRepository.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {deviceMode === 'phone' && (
          <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="editor">
                <Code className="h-4 w-4 mr-1" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="files">
                <Folder className="h-4 w-4 mr-1" />
                Files
              </TabsTrigger>
              <TabsTrigger value="github">
                <GitBranch className="h-4 w-4 mr-1" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="terminal">
                <Terminal className="h-4 w-4 mr-1" />
                Terminal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-0">
              {aiMode && activeFile ? (
                <AIPoweredCodeEditor
                  code={activeFile.content || ""}
                  language={activeFile.path.split('.').pop() || 'javascript'}
                  onChange={(content) => handleFileChange(activeFile.id, content)}
                  onSave={handleSave}
                />
              ) : (
                <MobileCodeEditor
                  openFiles={openFiles}
                  activeFileId={activeFileId}
                  onFileClose={closeFile}
                  onFileChange={handleFileChange}
                  onActiveFileChange={setActiveFileId}
                  onSave={handleSave}
                  onRun={handleRun}
                />
              )}
            </TabsContent>

            <TabsContent value="files" className="flex-1 p-4">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Files</h2>
                {repositoryFiles.length > 0 ? (
                  <div className="space-y-2">
                    {repositoryFiles.map((file) => (
                      <Card key={file.id} className="bg-dark-surface border-dark-border">
                        <CardContent className="p-3">
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-0"
                            onClick={() => openFile(file)}
                          >
                            <FileCode className="h-4 w-4 mr-2" />
                            <span className="truncate">{file.path}</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No files found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="github" className="flex-1 p-0">
              {currentRepository && (
                <SimpleGitHubDashboard
                  owner={currentRepository.fullName.split('/')[0]}
                  repo={currentRepository.fullName.split('/')[1]}
                />
              )}
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 p-4">
              <Card className="bg-dark-surface border-dark-border h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Terminal className="h-5 w-5 mr-2" />
                    Terminal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded p-4 h-40 overflow-y-auto font-mono text-sm">
                    <div className="text-green-400">$ Welcome to GitHV Terminal</div>
                    <div className="text-gray-400">Terminal functionality coming soon...</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {deviceMode !== 'phone' && (
          <div className="flex-1 flex">
            {/* Main Editor Area */}
            <div className="flex-1">
              {aiMode && activeFile ? (
                <AIPoweredCodeEditor
                  code={activeFile.content || ""}
                  language={activeFile.path.split('.').pop() || 'javascript'}
                  onChange={(content) => handleFileChange(activeFile.id, content)}
                  onSave={handleSave}
                />
              ) : (
                <MobileCodeEditor
                  openFiles={openFiles}
                  activeFileId={activeFileId}
                  onFileClose={closeFile}
                  onFileChange={handleFileChange}
                  onActiveFileChange={setActiveFileId}
                  onSave={handleSave}
                  onRun={handleRun}
                />
              )}
            </div>

            {/* Copilot Assistant Panel */}
            {copilotMode && activeFile && (
              <CopilotAssistant
                code={activeFile.content || ""}
                language={activeFile.path.split('.').pop() || 'javascript'}
                fileName={activeFile.path}
                onCodeChange={(content) => handleFileChange(activeFile.id, content)}
                onInsertCode={(code, position) => {
                  const currentContent = activeFile.content || "";
                  const newContent = position !== undefined 
                    ? currentContent.slice(0, position) + code + currentContent.slice(position)
                    : currentContent + "\n" + code;
                  handleFileChange(activeFile.id, newContent);
                }}
              />
            )}

            {/* Side Panel for GitHub/Terminal */}
            {deviceMode === 'desktop' && !copilotMode && currentRepository && (
              <div className="w-96 border-l border-dark-border">
                <SimpleGitHubDashboard
                  owner={currentRepository.fullName.split('/')[0]}
                  repo={currentRepository.fullName.split('/')[1]}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}