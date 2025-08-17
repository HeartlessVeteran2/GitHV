import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { 
  Menu, Code, GitBranch, Folder, Settings, User, Play, Square,
  FileCode, Terminal, Search, RefreshCw, LogOut, Github,
  ChevronRight, ChevronDown, File, Bug, TestTube, Zap,
  Bot, Brain, Sparkles, Monitor, Sun, Moon, MoreHorizontal
} from "lucide-react";
import FloatingAIAssistant from "./FloatingAIAssistant";
import MonacoEditor from "./MonacoEditor";
import type { Repository, File as FileType } from "@shared/schema";

interface AndroidStudioLayoutProps {
  onLogin: () => void;
}

export default function AndroidStudioLayout({ onLogin }: AndroidStudioLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [currentCode, setCurrentCode] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedText, setSelectedText] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onLogin();
      return;
    }
  }, [isAuthenticated, isLoading, onLogin]);

  // Handle Monaco editor events
  useEffect(() => {
    const handleSave = () => {
      const activeFile = openFiles.find(f => f.id === activeFileId);
      if (activeFile && currentCode !== undefined) {
        // Save file logic here
        console.log('Saving file:', activeFile.path);
      }
    };

    const handleRun = () => {
      console.log('Running code...');
      toast({
        title: "Running Code",
        description: "Code execution started",
      });
    };

    window.addEventListener('monaco-save', handleSave);
    window.addEventListener('monaco-run', handleRun);

    return () => {
      window.removeEventListener('monaco-save', handleSave);
      window.removeEventListener('monaco-run', handleRun);
    };
  }, [activeFileId, currentCode, openFiles, toast]);

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
        title: "Repositories synced",
        description: "GitHub repositories updated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        onLogin();
        return;
      }
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
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

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Group files by directory structure
  const fileTree = repositoryFiles.reduce((tree: any, file) => {
    const parts = file.path.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      if (!current[part]) {
        current[part] = isFile ? file : {};
      }
      
      if (!isFile) {
        current = current[part];
      }
    }
    
    return tree;
  }, {});

  const renderFileTree = (tree: any, basePath = '', level = 0) => {
    return Object.entries(tree).map(([name, value]) => {
      const currentPath = basePath ? `${basePath}/${name}` : name;
      const isFile = (value as any).id !== undefined;
      const isExpanded = expandedFolders.has(currentPath);
      
      return (
        <div key={currentPath}>
          <div
            className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
              isFile && activeFileId === (value as FileType).id ? 'bg-blue-600' : ''
            }`}
            style={{ paddingLeft: `${8 + level * 16}px` }}
            onClick={() => isFile ? openFile(value as FileType) : toggleFolder(currentPath)}
          >
            {!isFile && (
              isExpanded ? 
                <ChevronDown className="h-3 w-3 mr-1 flex-shrink-0" /> : 
                <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
            )}
            {isFile ? (
              <File className="h-3 w-3 mr-2 flex-shrink-0 text-blue-400" />
            ) : (
              <Folder className="h-3 w-3 mr-2 flex-shrink-0 text-yellow-500" />
            )}
            <span className="truncate">{name}</span>
          </div>
          {!isFile && isExpanded && renderFileTree(value, currentPath, level + 1)}
        </div>
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Github className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-2xl font-bold mb-2">GitHV IDE</h1>
            <p className="text-gray-400 mb-6">Professional web-based development environment</p>
            <Button onClick={onLogin} className="w-full bg-green-600 hover:bg-green-700">
              <Github className="h-4 w-4 mr-2" />
              Connect with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Top Menu Bar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-green-500" />
            <span className="font-semibold">GitHV</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-xs">File</Button>
            <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
            <Button variant="ghost" size="sm" className="text-xs">View</Button>
            <Button variant="ghost" size="sm" className="text-xs">Navigate</Button>
            <Button variant="ghost" size="sm" className="text-xs">Code</Button>
            <Button variant="ghost" size="sm" className="text-xs">Refactor</Button>
            <Button variant="ghost" size="sm" className="text-xs">Build</Button>
            <Button variant="ghost" size="sm" className="text-xs">Run</Button>
            <Button variant="ghost" size="sm" className="text-xs">Tools</Button>
            <Button variant="ghost" size="sm" className="text-xs">VCS</Button>
            <Button variant="ghost" size="sm" className="text-xs">Window</Button>
            <Button variant="ghost" size="sm" className="text-xs">Help</Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
              {user?.firstName?.[0] || 'U'}
            </div>
            <span className="text-sm">{user?.firstName || 'User'}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/api/logout"}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 space-x-2">
        <Button size="sm" variant="ghost" className="text-green-500">
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
        <Button size="sm" variant="ghost">
          <Square className="h-4 w-4 mr-1" />
          Stop
        </Button>
        <div className="w-px h-6 bg-gray-600 mx-2" />
        <Button size="sm" variant="ghost">
          <Bug className="h-4 w-4 mr-1" />
          Debug
        </Button>
        <Button size="sm" variant="ghost">
          <TestTube className="h-4 w-4 mr-1" />
          Test
        </Button>
        <div className="w-px h-6 bg-gray-600 mx-2" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => syncRepositoriesMutation.mutate()}
          disabled={syncRepositoriesMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${syncRepositoriesMutation.isPending ? 'animate-spin' : ''}`} />
          Sync
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setAiPanelOpen(!aiPanelOpen)}
          className={aiPanelOpen ? "bg-blue-600" : ""}
        >
          <Bot className="h-4 w-4 mr-1" />
          Copilot
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 88px)' }}>
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <div className="h-full bg-gray-800 border-r border-gray-700">
                  <Tabs defaultValue="project" className="h-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-b border-gray-700 rounded-none">
                      <TabsTrigger value="project" className="text-xs">
                        <Folder className="h-3 w-3 mr-1" />
                        Project
                      </TabsTrigger>
                      <TabsTrigger value="structure" className="text-xs">
                        <FileCode className="h-3 w-3 mr-1" />
                        Structure
                      </TabsTrigger>
                      <TabsTrigger value="git" className="text-xs">
                        <GitBranch className="h-3 w-3 mr-1" />
                        Git
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="project" className="m-0 h-full">
                      <div className="p-2 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Repositories</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => syncRepositoriesMutation.mutate()}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          {repositories.map((repo) => (
                            <div
                              key={repo.id}
                              className={`flex items-center p-2 rounded cursor-pointer text-sm ${
                                currentRepository?.id === repo.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                              }`}
                              onClick={() => setCurrentRepository(repo)}
                            >
                              <GitBranch className="h-3 w-3 mr-2 flex-shrink-0" />
                              <div className="truncate">
                                <p className="font-medium truncate">{repo.name}</p>
                                <p className="text-xs text-gray-400 truncate">{repo.fullName}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {currentRepository && (
                        <ScrollArea className="flex-1">
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                              {currentRepository.name}
                            </div>
                            {renderFileTree(fileTree)}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="structure" className="m-0 p-4">
                      <div className="text-center text-gray-400">
                        <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Structure view</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="git" className="m-0 p-4">
                      <div className="text-center text-gray-400">
                        <GitBranch className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Git integration</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={aiPanelOpen ? 50 : 70}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={terminalCollapsed ? 100 : 70}>
                <div className="h-full bg-gray-900">
                  {/* Tab Bar */}
                  {openFiles.length > 0 && (
                    <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
                      {openFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer text-sm ${
                            activeFileId === file.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                          onClick={() => setActiveFileId(file.id)}
                        >
                          <File className="h-3 w-3 mr-2" />
                          <span>{file.path.split('/').pop()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-0 h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeFile(file.id);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Editor Content */}
                  <div className="flex-1 relative">
                    {activeFileId ? (
                      <MonacoEditor
                        value={currentCode || openFiles.find(f => f.id === activeFileId)?.content || '// Welcome to GitHV IDE\n// Start coding...'}
                        language={openFiles.find(f => f.id === activeFileId)?.path.split('.').pop()?.toLowerCase() || 'javascript'}
                        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                        onChange={(value) => setCurrentCode(value)}
                        onCursorPositionChange={setCursorPosition}
                        onSelectionChange={setSelectedText}
                        height="100%"
                        width="100%"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Welcome to GitHV IDE</p>
                          <p className="text-sm">Open a file to start coding</p>
                          <div className="mt-6 space-y-2">
                            <Button
                              onClick={() => window.location.href = '/api/auth/github'}
                              className="mr-2 mb-2"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Connect GitHub
                            </Button>
                            <Button
                              onClick={() => syncRepositoriesMutation.mutate()}
                              disabled={syncRepositoriesMutation.isPending}
                              variant="outline"
                            >
                              <GitBranch className="h-4 w-4 mr-2" />
                              Sync Repositories
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              {/* Terminal Panel */}
              {!terminalCollapsed && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="h-full bg-black border-t border-gray-700">
                      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                        <div className="flex items-center space-x-2">
                          <Terminal className="h-4 w-4" />
                          <span className="text-sm">Terminal</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTerminalCollapsed(true)}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="p-4 font-mono text-sm text-green-400">
                        <div>$ Welcome to GitHV Terminal</div>
                        <div className="text-gray-500">Ready for commands...</div>
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* AI Assistant Panel */}
          {aiPanelOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                <div className="h-full bg-gray-800 border-l border-gray-700">
                  <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">AI Copilot</span>
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-2 w-2 mr-1" />
                        Gemini
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAiPanelOpen(false)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <Tabs defaultValue="suggestions" className="h-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-none border-b border-gray-700">
                      <TabsTrigger value="suggestions" className="text-xs">Suggest</TabsTrigger>
                      <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
                      <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suggestions" className="m-0 p-4">
                      <div className="text-center text-gray-400">
                        <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">AI suggestions will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="m-0 p-4">
                      <div className="flex flex-col h-full">
                        <div className="flex-1 mb-4">
                          <div className="text-center text-gray-400">
                            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Start a conversation</p>
                          </div>
                        </div>
                        <Input placeholder="Ask about your code..." />
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="m-0 p-4">
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Zap className="h-3 w-3 mr-2" />
                          Optimize Code
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <TestTube className="h-3 w-3 mr-2" />
                          Generate Tests
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Bug className="h-3 w-3 mr-2" />
                          Find Issues
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <FileCode className="h-3 w-3 mr-2" />
                          Add Comments
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          {currentRepository && (
            <>
              <span>•</span>
              <span>{currentRepository.name}</span>
            </>
          )}
          {activeFileId && (
            <>
              <span>•</span>
              <span>{openFiles.find(f => f.id === activeFileId)?.path}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>LF</span>
          <span>Spaces: 2</span>
          <span>TypeScript</span>
        </div>
      </div>

      {/* Floating AI Assistant */}
      {activeFileId && (
        <FloatingAIAssistant
          code={currentCode || openFiles.find(f => f.id === activeFileId)?.content || ""}
          language={openFiles.find(f => f.id === activeFileId)?.path.split('.').pop() || 'javascript'}
          fileName={openFiles.find(f => f.id === activeFileId)?.path}
          cursorPosition={cursorPosition}
          selectedText={selectedText}
          onCodeInsert={(code) => {
            const currentContent = currentCode || openFiles.find(f => f.id === activeFileId)?.content || "";
            const beforeCursor = currentContent.slice(0, cursorPosition);
            const afterCursor = currentContent.slice(cursorPosition);
            setCurrentCode(beforeCursor + code + afterCursor);
          }}
          onCodeReplace={(code) => {
            if (selectedText) {
              const currentContent = currentCode || openFiles.find(f => f.id === activeFileId)?.content || "";
              const newContent = currentContent.replace(selectedText, code);
              setCurrentCode(newContent);
              setSelectedText("");
            }
          }}
        />
      )}
    </div>
  );
}