import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Menu, FileText, Save, Play, Search, Settings, RefreshCw,
  Folder, Terminal, Code, Plus, Filter, Eye, EyeOff, ChevronDown
} from "lucide-react";

interface SimpleMobileDropdownsProps {
  onAction: (action: string, data?: any) => void;
  currentFile?: string;
  repositoryFiles: any[];
  isFileTreeOpen: boolean;
}

export default function SimpleMobileDropdowns({
  onAction,
  currentFile,
  repositoryFiles,
  isFileTreeOpen
}: SimpleMobileDropdownsProps) {
  const recentFiles = repositoryFiles.slice(0, 5);

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-dark-surface border-b border-dark-border">
      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8" 
          onClick={() => onAction('save')}
          title="Save"
        >
          <Save className="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8" 
          onClick={() => onAction('run')}
          title="Run"
        >
          <Play className="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8" 
          onClick={() => onAction('toggle-file-tree')}
          title="Toggle File Tree"
        >
          {isFileTreeOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8" 
          onClick={() => onAction('search')}
          title="Search"
        >
          <Search className="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8" 
          onClick={() => onAction('sync')}
          title="Sync"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* File Selector */}
      <div className="flex-1 max-w-[200px]">
        <Select value={currentFile} onValueChange={(value) => onAction('open-file', value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select file">
              {currentFile ? (
                <div className="flex items-center space-x-1 truncate">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{currentFile.split('/').pop()}</span>
                </div>
              ) : (
                "No file"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <SelectItem key={file.id} value={file.path} className="text-xs">
                  <div className="flex items-center space-x-2 w-full">
                    <FileText className="h-3 w-3 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{file.path.split('/').pop()}</div>
                      <div className="truncate text-gray-400 text-xs">{file.path}</div>
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-files" disabled>
                No files available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Settings Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8" 
        onClick={() => onAction('settings')}
        title="Settings"
      >
        <Settings className="h-3 w-3" />
      </Button>
    </div>
  );
}