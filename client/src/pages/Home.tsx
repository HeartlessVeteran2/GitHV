import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import Terminal from "@/components/Terminal";
import FileExplorer from "@/components/FileExplorer";
import { Button } from "@/components/ui/button";
import type { Repository, File as FileType } from "@shared/schema";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const syncFilesMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return apiRequest("POST", `/api/repositories/${repositoryId}/files/sync`);
    },
    onSuccess: () => {
      if (currentRepository) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/repositories", currentRepository.id, "files"] 
        });
      }
      toast({
        title: "Success",
        description: "Files synced successfully",
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
      toast({
        title: "Success", 
        description: "File saved successfully",
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

  // Set the first repository as current if available
  useEffect(() => {
    if (repositories.length > 0 && !currentRepository) {
      setCurrentRepository(repositories[0]);
    }
  }, [repositories, currentRepository]);

  // Sync files when repository changes
  useEffect(() => {
    if (currentRepository) {
      syncFilesMutation.mutate(currentRepository.id);
    }
  }, [currentRepository]);

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

  const handleFileChange = (fileId: string, content: string) => {
    setOpenFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, content } : file
    ));
  };

  const handleSave = () => {
    if (activeFileId) {
      const activeFile = openFiles.find(f => f.id === activeFileId);
      if (activeFile) {
        updateFileMutation.mutate({
          fileId: activeFileId,
          content: activeFile.content || ""
        });
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleRun = () => {
    if (activeFileId) {
      toast({
        title: "Running Code",
        description: "Code execution feature is coming soon",
      });
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "git.commit":
        toast({
          title: "Git Commit",
          description: "Commit functionality coming soon",
        });
        break;
      case "file.new":
        toast({
          title: "New File", 
          description: "Use the file explorer to create new files",
        });
        break;
      case "terminal.clear":
        toast({
          title: "Terminal Clear",
          description: "Terminal cleared",
        });
        break;
      case "git.push":
        toast({
          title: "Git Push",
          description: "Push functionality coming soon",
        });
        break;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeFileId, openFiles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-dark-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text overflow-hidden">
      <Header
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        onPush={() => toast({ title: "Push", description: "Push functionality coming soon" })}
        onSync={() => syncRepositoriesMutation.mutate()}
      />
      
      <div className="flex h-screen bg-dark-bg overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
        {sidebarVisible && (
          <Sidebar
            currentRepository={currentRepository}
            onFileSelect={handleFileSelect}
            selectedFileId={activeFileId}
          />
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          {repositories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-4">No repositories found</h2>
                <p className="text-gray-400 mb-6">
                  Sync your GitHub repositories to start coding
                </p>
                <Button
                  onClick={() => syncRepositoriesMutation.mutate()}
                  disabled={syncRepositoriesMutation.isPending}
                  className="bg-github-blue hover:bg-blue-600"
                >
                  {syncRepositoriesMutation.isPending ? "Syncing..." : "Sync Repositories"}
                </Button>
              </div>
            </div>
          ) : (
            <CodeEditor
              openFiles={openFiles}
              activeFileId={activeFileId}
              onFileClose={handleFileClose}
              onFileChange={handleFileChange}
              onActiveFileChange={setActiveFileId}
              repositories={repositories}
              onSave={handleSave}
              onRun={handleRun}
            />
          )}
          
          {terminalVisible && <Terminal />}
        </div>
      </div>
    </div>
  );
}
