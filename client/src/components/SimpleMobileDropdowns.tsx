import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const fileSelectorRef = useRef<HTMLDivElement>(null);
  const recentFiles = repositoryFiles.slice(0, 5);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (fileSelectorRef.current && !fileSelectorRef.current.contains(event.target as Node)) {
        setShowFileSelector(false);
      }
    };

    if (showQuickMenu || showFileSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showQuickMenu, showFileSelector]);

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-dark-surface border-b border-dark-border">
      {/* Quick Action Buttons with Menu */}
      <div className="flex items-center space-x-1">
        <Popover open={showQuickMenu} onOpenChange={setShowQuickMenu}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8" 
              title="Quick Actions"
            >
              <Menu className="h-3 w-3" />
              <ChevronDown className="h-2 w-2 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start" ref={quickMenuRef}>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-8" 
                onClick={() => { onAction('save'); setShowQuickMenu(false); }}
              >
                <Save className="h-3 w-3 mr-2" />
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-8" 
                onClick={() => { onAction('run'); setShowQuickMenu(false); }}
              >
                <Play className="h-3 w-3 mr-2" />
                Run
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-8" 
                onClick={() => { onAction('search'); setShowQuickMenu(false); }}
              >
                <Search className="h-3 w-3 mr-2" />
                Search
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-8" 
                onClick={() => { onAction('sync'); setShowQuickMenu(false); }}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Sync
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
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
          onClick={() => onAction('toggle-file-tree')}
          title="Toggle File Tree"
        >
          {isFileTreeOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>

      {/* File Selector */}
      <div className="flex-1 max-w-[200px]" ref={fileSelectorRef}>
        <Select 
          value={currentFile} 
          onValueChange={(value) => { 
            onAction('open-file', value); 
            setShowFileSelector(false); 
          }}
          open={showFileSelector}
          onOpenChange={setShowFileSelector}
        >
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
        onClick={() => { 
          onAction('settings'); 
          setShowQuickMenu(false); 
          setShowFileSelector(false); 
        }}
        title="Settings"
      >
        <Settings className="h-3 w-3" />
      </Button>
    </div>
  );
}