import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FilePlus, FolderPlus } from "lucide-react";

interface FileExplorerProps {
  repositoryId: string | null;
}

export default function FileExplorer({ repositoryId }: FileExplorerProps) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFileMutation = useMutation({
    mutationFn: async (data: { repositoryId: string; path: string; content: string }) => {
      return apiRequest("POST", `/api/repositories/${data.repositoryId}/files`, {
        path: data.path,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repositories", repositoryId, "files"] });
      setShowNewFileDialog(false);
      setNewFileName("");
      toast({
        title: "Success",
        description: "File created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateFile = () => {
    if (!repositoryId || !newFileName.trim()) return;
    
    createFileMutation.mutate({
      repositoryId,
      path: newFileName.trim(),
      content: "",
    });
  };

  const handleCreateFolder = () => {
    // For now, we'll create a .gitkeep file in the folder
    if (!repositoryId || !newFolderName.trim()) return;
    
    createFileMutation.mutate({
      repositoryId,
      path: `${newFolderName.trim()}/.gitkeep`,
      content: "",
    });
    
    setShowNewFolderDialog(false);
    setNewFolderName("");
  };

  return (
    <>
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1"
          onClick={() => setShowNewFileDialog(true)}
          disabled={!repositoryId}
        >
          <FilePlus className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1"
          onClick={() => setShowNewFolderDialog(true)}
          disabled={!repositoryId}
        >
          <FolderPlus className="h-3 w-3" />
        </Button>
      </div>

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter file name (e.g., components/Button.tsx)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="bg-dark-bg border-dark-border"
              onKeyPress={(e) => e.key === "Enter" && handleCreateFile()}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewFileDialog(false)}
                className="border-dark-border"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFile}
                disabled={!newFileName.trim() || createFileMutation.isPending}
                className="bg-github-blue hover:bg-blue-600"
              >
                Create File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-dark-bg border-dark-border"
              onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewFolderDialog(false)}
                className="border-dark-border"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || createFileMutation.isPending}
                className="bg-github-blue hover:bg-blue-600"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
