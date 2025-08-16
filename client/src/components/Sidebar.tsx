import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  MoreHorizontal,
  FilePlus,
  FolderPlus,
  Github
} from "lucide-react";
import type { Repository, File as FileType } from "@shared/schema";

interface SidebarProps {
  currentRepository: Repository | null;
  onFileSelect: (file: FileType) => void;
  selectedFileId: string | null;
}

export default function Sidebar({ currentRepository, onFileSelect, selectedFileId }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const { data: files = [] } = useQuery<FileType[]>({
    queryKey: ["/api/repositories", currentRepository?.id, "files"],
    enabled: !!currentRepository,
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="h-4 w-4 text-yellow-400" />;
      case 'json':
        return <File className="h-4 w-4 text-green-400" />;
      case 'md':
        return <File className="h-4 w-4 text-blue-400" />;
      case 'css':
        return <File className="h-4 w-4 text-purple-400" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const buildFileTree = (files: FileType[]) => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isFile: index === parts.length - 1,
            children: {},
            file: index === parts.length - 1 ? file : null
          };
        }
        current = current[part].children;
      });
    });
    
    return tree;
  };

  const renderFileTree = (tree: any, depth = 0) => {
    return Object.values(tree).map((node: any) => {
      const isExpanded = expandedFolders.has(node.path);
      const hasChildren = Object.keys(node.children).length > 0;
      
      return (
        <div key={node.path} style={{ marginLeft: `${depth * 16}px` }}>
          <div
            className={`flex items-center space-x-2 px-2 py-1 text-sm cursor-pointer rounded hover:bg-dark-bg ${
              selectedFileId === node.file?.id ? 'bg-dark-bg' : ''
            }`}
            onClick={() => {
              if (node.isFile) {
                onFileSelect(node.file);
              } else if (hasChildren) {
                toggleFolder(node.path);
              }
            }}
          >
            {!node.isFile && hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )
            )}
            {node.isFile ? (
              getFileIcon(node.name)
            ) : (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-400" />
              ) : (
                <Folder className="h-4 w-4 text-blue-400" />
              )
            )}
            <span className="truncate">{node.name}</span>
            {node.file && (
              <span className="text-orange-400 text-xs">M</span>
            )}
          </div>
          {!node.isFile && hasChildren && isExpanded && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const fileTree = buildFileTree(files);

  // Mock git status for demo
  const mockChanges = [
    { path: "src/components/App.js", status: "M", color: "text-orange-400" },
    { path: "src/utils/helpers.js", status: "A", color: "text-green-400" },
    { path: "old-file.js", status: "D", color: "text-red-400" },
  ];

  return (
    <aside className="w-80 bg-dark-surface border-r border-dark-border flex-shrink-0 flex flex-col">
      {/* Repository Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-sm text-gray-400">REPOSITORY</h2>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Github className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {currentRepository?.name || "No repository selected"}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {currentRepository?.defaultBranch || "main"} branch
        </div>
      </div>

      {/* Git Status */}
      <div className="px-4 py-3 border-b border-dark-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Changes</span>
          <span className="bg-github-blue text-white px-2 py-1 rounded-full text-xs">
            {mockChanges.length}
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {mockChanges.map((change, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <span className={change.color}>{change.status}</span>
              <span className="truncate">{change.path}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-gray-400">EXPLORER</h3>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="p-1">
                <FilePlus className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1">
                <FolderPlus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="px-2 py-2 h-full">
          {renderFileTree(fileTree)}
        </ScrollArea>
      </div>
    </aside>
  );
}
