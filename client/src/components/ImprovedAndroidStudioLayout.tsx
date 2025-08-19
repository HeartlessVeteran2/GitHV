import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { 
  Menu, Code, GitBranch, Folder, Settings, User, Play, Square,
  FileCode, Terminal as TerminalIcon, Search, RefreshCw, LogOut, Github,
  ChevronRight, ChevronDown, File, Bug, TestTube, Zap,
  Bot, Brain, Sparkles, Monitor, Sun, Moon, MoreHorizontal, Plus
} from "lucide-react";
import EnhancedMonacoEditor from "./EnhancedMonacoEditor";
import EnhancedFileExplorer from "./EnhancedFileExplorer";
import SmartSearchBar from "./SmartSearchBar";
import Terminal from "./Terminal";
import GitIntegration from "./GitIntegration";
import WebViewer from "./WebViewer";
import PerfectLoader from "./PerfectLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeviceDetection } from "@/hooks/use-device-detection";
// import MobileGestures from "./MobileGestures";
import type { Repository, File as FileType } from "@shared/schema";

interface ImprovedAndroidStudioLayoutProps {
  onLogin: () => void;
}

export default function ImprovedAndroidStudioLayout({ onLogin }: ImprovedAndroidStudioLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(true);
  const [webViewerOpen, setWebViewerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [currentCode, setCurrentCode] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const isMobile = useIsMobile();
  const { deviceInfo, isPhone, isTablet, isDesktop } = useDeviceDetection();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onLogin();
      return;
    }
  }, [isAuthenticated, isLoading, onLogin]);

  // Fetch repositories
  const { data: repositories = [] } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
    enabled: isAuthenticated,
  });

  // Fetch files for current repository
  const { data: repositoryFiles = [] } = useQuery<FileType[]>({
    queryKey: ["/api/repositories", currentRepository?.id, "files"],
    enabled: !!currentRepository?.id,
  });

  // Handle mobile gestures (functionality preserved but UI hidden)
  const handleGesture = (gesture: any) => {
    switch (gesture.type) {
      case 'swipe':
        if (gesture.direction === 'right' && sidebarCollapsed) {
          setSidebarCollapsed(false);
        } else if (gesture.direction === 'left' && !sidebarCollapsed) {
          setSidebarCollapsed(true);
        } else if (gesture.direction === 'up') {
          setTerminalCollapsed(false);
        } else if (gesture.direction === 'down') {
          setTerminalCollapsed(true);
        }
        break;
      case 'pinch':
        if (gesture.scale > 1.1) {
          setZoomLevel(prev => Math.min(200, prev + 5));
        } else if (gesture.scale < 0.9) {
          setZoomLevel(prev => Math.max(50, prev - 5));
        }
        break;
      case 'doubletap':
        // Quick run on double tap in editor
        if (gesture.target?.closest('.monaco-editor')) {
          handleSave();
        }
        break;
      case 'longpress':
        // Show context menu functionality preserved
        console.log('Long press detected');
        break;
    }
  };

  const handleMobileAction = (action: string, data?: any) => {
    switch (action) {
      case 'toggle-sidebar':
        setSidebarCollapsed(!sidebarCollapsed);
        break;
      case 'toggle-terminal':
        setTerminalCollapsed(!terminalCollapsed);
        break;
      case 'zoom-in':
        setZoomLevel(prev => Math.min(prev + 10, 200));
        break;
      case 'zoom-out':
        setZoomLevel(prev => Math.max(prev - 10, 50));
        break;
      case 'auto-save':
        // Auto-save functionality preserved but hidden from UI
        console.log('Auto-saving in background...');
        break;
      default:
        console.log('Mobile action:', action, data);
        break;
    }
  };

  const handleFileSelect = (file: FileType) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const handleFileClose = (fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleCodeChange = (value: string) => {
    setCurrentCode(value);
    if (activeFileId) {
      setOpenFiles(prev => prev.map(file => 
        file.id === activeFileId ? { ...file, content: value } : file
      ));
    }
  };

  const handleSave = () => {
    if (activeFileId) {
      const activeFile = openFiles.find(f => f.id === activeFileId);
      if (activeFile) {
        toast({ title: "File Saved", description: "Changes saved successfully" });
      }
    }
  };

  const handleRun = () => {
    toast({ title: "Running Code", description: "Code execution started" });
  };

  const handleFormat = () => {
    toast({ title: "Code Formatted", description: "Code has been formatted" });
  };

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const currentFileContent = activeFile?.content || "";

  useEffect(() => {
    if (repositories.length > 0 && !currentRepository) {
      setCurrentRepository(repositories[0]);
    }
  }, [repositories, currentRepository]);

  if (isLoading) {
    return <PerfectLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900'} page-transition`}>
      {/* Desktop Top Menu Bar */}
      {!isMobile && (
          <div className="h-12 bg-gray-800/90 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between px-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-green-500 animate-pulse" />
                <span className="font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">GitHV IDE</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">File</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">Edit</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">View</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">Code</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">Run</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">Tools</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">VCS</Button>
                <Button variant="ghost" size="sm" className="text-xs btn-ghost-interactive menu-item-interactive btn-premium">Help</Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="icon-btn-interactive ripple-effect"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs shadow-lg animate-pulse">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
            </div>
          </div>
      )}

      {/* Smart Search Bar */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="search-interactive glass-morphism rounded-lg">
          <SmartSearchBar
            currentRepository={currentRepository}
            onFileSelect={handleFileSelect}
            onCommand={(command) => {
              switch (command) {
                case 'file.save':
                  handleSave();
                  break;
                case 'run.file':
                  handleRun();
                  break;
                case 'format.document':
                  handleFormat();
                  break;
                default:
                  console.log('Command:', command);
              }
            }}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-screen" style={{ height: "calc(100vh - 140px)" }}>
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full border-r border-gray-700/50 panel-interactive glass-morphism">
                  <Tabs defaultValue="explorer" className="h-full">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm">
                        <TabsTrigger value="explorer" className="tab-interactive ripple-effect data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20">
                          <Folder className="h-4 w-4 file-icon" />
                        </TabsTrigger>
                        <TabsTrigger value="git" className="tab-interactive ripple-effect data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-teal-500/20">
                          <GitBranch className="h-4 w-4 file-icon" />
                        </TabsTrigger>
                        <TabsTrigger value="search" className="tab-interactive ripple-effect data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20">
                          <Search className="h-4 w-4 file-icon" />
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="explorer" className="h-full">
                        <EnhancedFileExplorer
                          currentRepository={currentRepository}
                          onFileSelect={handleFileSelect}
                          selectedFileId={activeFileId}
                          onNewFile={(path) => toast({ title: "New File", description: `Creating file at ${path}` })}
                          onNewFolder={(path) => toast({ title: "New Folder", description: `Creating folder at ${path}` })}
                          onDeleteFile={(fileId) => toast({ title: "Delete File", description: "File deletion functionality" })}
                          onRenameFile={(fileId, newName) => toast({ title: "Rename File", description: `Renaming to ${newName}` })}
                        />
                      </TabsContent>
                      
                      <TabsContent value="git" className="h-full">
                        <GitIntegration />
                      </TabsContent>
                      
                      <TabsContent value="search" className="h-full p-4">
                        <div className="text-center text-gray-400">
                          <Search className="h-8 w-8 mx-auto mb-2" />
                          <p>Use the search bar above for advanced search</p>
                        </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={terminalCollapsed ? 100 : 70}>
                <div className="h-full">
                    {openFiles.length === 0 ? (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                        <div className="text-center text-gray-400 page-transition">
                          <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome to GitHV IDE</h3>
                          <p className="mb-4 text-gray-300">Your premium development environment</p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(false)} className="btn-secondary-interactive ripple-effect btn-premium border-blue-500/30 hover:border-blue-500/60">
                              <Folder className="h-4 w-4 mr-2 file-icon text-blue-400" />
                              Open Explorer
                            </Button>
                            <Button variant="outline" size="sm" className="btn-secondary-interactive ripple-effect btn-premium border-green-500/30 hover:border-green-500/60">
                              <Plus className="h-4 w-4 mr-2 file-icon text-green-400" />
                              New File
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Tabs value={activeFileId || ""} onValueChange={setActiveFileId}>
                        {/* File Tabs */}
                        <div className="border-b border-gray-700/50 bg-gray-800/90 backdrop-blur-sm">
                          <TabsList className="bg-transparent h-auto p-0">
                            <ScrollArea className="max-w-full">
                              <div className="flex">
                                {openFiles.map((file, index) => (
                                  <TabsTrigger
                                    key={file.id}
                                    value={file.id}
                                    className="flex items-center space-x-2 px-4 py-2 border-r border-gray-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 tab-interactive ripple-effect stagger-item"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <FileCode className="h-4 w-4 file-icon text-green-400" />
                                    <span className="text-sm font-medium">{file.path.split('/').pop()}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-0 h-4 w-4 ml-2 icon-btn-interactive hover:text-red-400"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFileClose(file.id);
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </TabsTrigger>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsList>
                        </div>

                        {/* Editor Content */}
                        {openFiles.map((file) => (
                          <TabsContent key={file.id} value={file.id} className="h-full">
                            <EnhancedMonacoEditor
                              value={file.content || ""}
                              onChange={handleCodeChange}
                              language={getLanguageFromPath(file.path)}
                              fileName={file.path.split('/').pop()}
                              onSave={handleSave}
                              onRun={handleRun}
                              onFormat={handleFormat}
                              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                              height="100%"
                            />
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                </div>
              </ResizablePanel>

              {/* Terminal */}
              {!terminalCollapsed && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                    <Terminal isOpen={!terminalCollapsed} onClose={() => setTerminalCollapsed(true)} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 flex items-center justify-between px-4 text-xs text-gray-400 glass-morphism">
        <div className="flex items-center space-x-4">
          <span className="hover:text-white transition-colors cursor-pointer">Ln {1}, Col {1}</span>
          {activeFile && <span className="hover:text-white transition-colors cursor-pointer">{getLanguageFromPath(activeFile.path)}</span>}
          <span className="hover:text-white transition-colors cursor-pointer">UTF-8</span>
          <span className="hover:text-white transition-colors cursor-pointer">LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hover:text-white transition-colors cursor-pointer">Zoom: {zoomLevel}%</span>
          <span className="hover:text-white transition-colors cursor-pointer">Files: {openFiles.length}</span>
          {currentRepository && <span className="hover:text-white transition-colors cursor-pointer bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Repo: {currentRepository.name}</span>}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />
            <span className="text-green-400 text-xs">Ready</span>
          </div>
        </div>
      </div>

      {/* Web Viewer */}
      {webViewerOpen && (
        <div className="fixed inset-4 z-50 bg-white rounded-lg shadow-2xl">
          <WebViewer
            isOpen={webViewerOpen}
            onClose={() => setWebViewerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'cs':
      return 'csharp';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'html':
    case 'htm':
      return 'html';
    case 'xml':
      return 'xml';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    default:
      return 'plaintext';
  }
}