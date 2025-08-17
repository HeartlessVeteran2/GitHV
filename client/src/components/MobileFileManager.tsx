import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  File, Folder, Search, Filter, Star, Clock,
  ChevronRight, FileText, Code, Image, 
  Video, Archive, Plus, X, FolderOpen,
  SortAsc, SortDesc, Grid, List
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  extension?: string;
  starred?: boolean;
}

interface MobileFileManagerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileAction: (action: string, file: FileItem) => void;
  recentFiles?: FileItem[];
  starredFiles?: FileItem[];
}

export default function MobileFileManager({
  files,
  onFileSelect,
  onFileAction,
  recentFiles = [],
  starredFiles = []
}: MobileFileManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="h-4 w-4 text-yellow-500" />;
    }

    const ext = file.extension?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <Code className="h-4 w-4 text-blue-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4 text-green-400" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="h-4 w-4 text-purple-400" />;
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className="h-4 w-4 text-orange-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by folder
    if (selectedFolder) {
      result = result.filter(file => 
        file.path.startsWith(selectedFolder) && 
        file.path !== selectedFolder
      );
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by file type
    if (fileTypeFilter !== 'all') {
      result = result.filter(file => {
        if (fileTypeFilter === 'folders') return file.type === 'folder';
        if (fileTypeFilter === 'code') {
          const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'];
          return codeExts.includes(file.extension?.toLowerCase() || '');
        }
        if (fileTypeFilter === 'images') {
          const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
          return imageExts.includes(file.extension?.toLowerCase() || '');
        }
        return true;
      });
    }

    // Sort files
    result.sort((a, b) => {
      let comparison = 0;
      
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          const aTime = a.modified?.getTime() || 0;
          const bTime = b.modified?.getTime() || 0;
          comparison = aTime - bTime;
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [files, selectedFolder, searchQuery, fileTypeFilter, sortBy, sortOrder]);

  const fileTypes = [
    { id: 'all', label: 'All Files', count: files.length },
    { id: 'folders', label: 'Folders', count: files.filter(f => f.type === 'folder').length },
    { id: 'code', label: 'Code', count: files.filter(f => ['js', 'ts', 'jsx', 'tsx', 'py'].includes(f.extension || '')).length },
    { id: 'images', label: 'Images', count: files.filter(f => ['png', 'jpg', 'jpeg', 'gif'].includes(f.extension || '')).length },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>File Manager</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="browse" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="recent">
              Recent
              {recentFiles.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {recentFiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="starred">
              Starred
              {starredFiles.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {starredFiles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-4">
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </div>

              {showFilters && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {fileTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={fileTypeFilter === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFileTypeFilter(type.id)}
                        className="text-xs"
                      >
                        {type.label}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {type.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortBy('name')}
                      className={sortBy === 'name' ? 'bg-blue-100' : ''}
                    >
                      Name
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortBy('modified')}
                      className={sortBy === 'modified' ? 'bg-blue-100' : ''}
                    >
                      Modified
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* File List */}
            <ScrollArea className="h-[50vh]">
              {viewMode === 'list' ? (
                <div className="space-y-1">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                      onClick={() => file.type === 'file' ? onFileSelect(file) : setSelectedFolder(file.path)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(file)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{file.path}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {file.type === 'file' && (
                          <div className="text-xs text-gray-400 text-right">
                            <div>{formatFileSize(file.size)}</div>
                            <div>{formatDate(file.modified)}</div>
                          </div>
                        )}
                        {file.type === 'folder' && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer text-center"
                      onClick={() => file.type === 'file' ? onFileSelect(file) : setSelectedFolder(file.path)}
                    >
                      <div className="flex justify-center mb-2">
                        {getFileIcon(file)}
                      </div>
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      {file.type === 'file' && (
                        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                    onClick={() => onFileSelect(file)}
                  >
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-gray-500 truncate">{file.path}</div>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="starred" className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {starredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                    onClick={() => onFileSelect(file)}
                  >
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-gray-500 truncate">{file.path}</div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}