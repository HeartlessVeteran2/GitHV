import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
  Folder, FolderOpen, File, Search, Plus, RefreshCw,
  FileText, FileCode, Image, Archive, Settings,
  ChevronRight, ChevronDown, MoreHorizontal, Copy,
  Trash2, Edit, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Repository, File as FileType } from '@shared/schema';

interface EnhancedFileExplorerProps {
  currentRepository: Repository | null;
  onFileSelect: (file: FileType) => void;
  selectedFileId: string | null;
  onNewFile?: (path: string) => void;
  onNewFolder?: (path: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (fileId: string, newName: string) => void;
}

interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  size?: number;
  lastModified?: string;
  extension?: string;
}

const getFileIcon = (fileName: string, isFolder: boolean = false, isOpen: boolean = false) => {
  if (isFolder) {
    return isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'php':
    case 'rb':
    case 'go':
    case 'rs':
      return <FileCode className="h-4 w-4 text-green-400" />;
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'ini':
    case 'cfg':
      return <Settings className="h-4 w-4 text-orange-400" />;
    case 'md':
    case 'txt':
    case 'doc':
    case 'docx':
      return <FileText className="h-4 w-4 text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <Image className="h-4 w-4 text-purple-400" />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
    case '7z':
      return <Archive className="h-4 w-4 text-yellow-400" />;
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function EnhancedFileExplorer({
  currentRepository,
  onFileSelect,
  selectedFileId,
  onNewFile,
  onNewFolder,
  onDeleteFile,
  onRenameFile
}: EnhancedFileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'modified'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: files = [], isLoading, refetch } = useQuery<FileType[]>({
    queryKey: ["/api/repositories", currentRepository?.id, "files"],
    enabled: !!currentRepository?.id,
    refetchOnWindowFocus: false,
  });

  // Build file tree structure
  const fileTree = useMemo(() => {
    if (!files.length) return [];

    const tree: FileTreeNode[] = [];
    const pathMap = new Map<string, FileTreeNode>();

    // Sort files based on current sort settings
    const sortedFiles = [...files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.path.localeCompare(b.path);
          break;
        case 'type':
          const aExt = a.path.split('.').pop() || '';
          const bExt = b.path.split('.').pop() || '';
          comparison = aExt.localeCompare(bExt);
          break;
        case 'size':
          comparison = (a.content?.length || 0) - (b.content?.length || 0);
          break;
        case 'modified':
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    for (const file of sortedFiles) {
      // Filter by search query
      if (searchQuery && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        continue;
      }

      const pathParts = file.path.split('/');
      let currentPath = '';

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = i === pathParts.length - 1;

        if (!pathMap.has(currentPath)) {
          const node: FileTreeNode = {
            id: isFile ? file.id : currentPath,
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            size: isFile ? file.content?.length : undefined,
            lastModified: isFile ? (file.updatedAt ? new Date(file.updatedAt).toISOString() : undefined) : undefined,
            extension: isFile ? part.split('.').pop() : undefined,
          };

          pathMap.set(currentPath, node);

          if (parentPath) {
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      }
    }

    return tree;
  }, [files, searchQuery, sortBy, sortOrder]);

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

  const handleFileClick = (node: FileTreeNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
    } else {
      const file = files.find(f => f.id === node.id);
      if (file) {
        onFileSelect(file);
      }
    }
  };

  const renderTreeNode = (node: FileTreeNode, level: number = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFileId === node.id;

    return (
      <div key={node.path}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center px-2 py-1 cursor-pointer hover:bg-gray-700 rounded-sm transition-colors",
                isSelected && "bg-blue-600 hover:bg-blue-700",
                "group"
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => handleFileClick(node)}
            >
              {isFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-4 w-4 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(node.path);
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              
              {getFileIcon(node.name, isFolder, isExpanded)}
              
              <span className="ml-2 text-sm truncate flex-1">{node.name}</span>
              
              {!isFolder && node.size !== undefined && (
                <Badge variant="outline" className="text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatFileSize(node.size)}
                </Badge>
              )}
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent>
            {isFolder ? (
              <>
                <ContextMenuItem onClick={() => onNewFile?.(node.path)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onNewFolder?.(node.path)}>
                  <Folder className="h-4 w-4 mr-2" />
                  New Folder
                </ContextMenuItem>
              </>
            ) : (
              <>
                <ContextMenuItem onClick={() => handleFileClick(node)}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(node.path)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Path
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onRenameFile?.(node.id, node.name)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => onDeleteFile?.(node.id)}
                  className="text-red-400 focus:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Explorer</h3>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 mt-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="size">Size</option>
            <option value="modified">Modified</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-6 px-2 text-xs"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400 text-sm">Loading files...</div>
        ) : fileTree.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            {searchQuery ? 'No files found matching search' : 'No files found'}
          </div>
        ) : (
          <div className="p-1">
            {fileTree.map(node => renderTreeNode(node))}
          </div>
        )}
      </ScrollArea>

      {/* Status */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-400">
        {files.length} files
        {searchQuery && ` (filtered)`}
      </div>
    </div>
  );
}