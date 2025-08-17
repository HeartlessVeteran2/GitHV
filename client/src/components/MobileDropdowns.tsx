import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Menu, ChevronDown, Play, Bug, TestTube, GitBranch,
  Settings, Palette, Code, Terminal, FileText, Folder,
  Plus, Search, Filter, MoreVertical
} from "lucide-react";

interface MobileDropdownsProps {
  onAction: (action: string, data?: any) => void;
  currentFile?: string;
  repositoryFiles?: any[];
  isFileTreeOpen?: boolean;
}

export default function MobileDropdowns({ 
  onAction, 
  currentFile, 
  repositoryFiles = [], 
  isFileTreeOpen 
}: MobileDropdownsProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const mainMenuItems = [
    { label: "Run Code", icon: <Play className="h-4 w-4" />, action: "run", color: "text-green-400" },
    { label: "Debug", icon: <Bug className="h-4 w-4" />, action: "debug", color: "text-red-400" },
    { label: "Test", icon: <TestTube className="h-4 w-4" />, action: "test", color: "text-blue-400" },
    { label: "Git Sync", icon: <GitBranch className="h-4 w-4" />, action: "git-sync", color: "text-purple-400" },
  ];

  const viewMenuItems = [
    { label: "Toggle File Tree", icon: <Folder className="h-4 w-4" />, action: "toggle-file-tree" },
    { label: "Toggle Terminal", icon: <Terminal className="h-4 w-4" />, action: "toggle-terminal" },
    { label: "Toggle AI Assistant", icon: <Code className="h-4 w-4" />, action: "toggle-ai" },
    { label: "Theme Settings", icon: <Palette className="h-4 w-4" />, action: "theme" },
  ];

  const fileActions = [
    { label: "New File", icon: <Plus className="h-4 w-4" />, action: "new-file" },
    { label: "Search Files", icon: <Search className="h-4 w-4" />, action: "search-files" },
    { label: "Filter Files", icon: <Filter className="h-4 w-4" />, action: "filter-files" },
  ];

  const recentFiles = repositoryFiles.slice(0, 5);

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-dark-surface border-b border-dark-border">
      {/* Main Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <Menu className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mainMenuItems.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => onAction(item.action)}
              className="flex items-center space-x-2"
            >
              <span className={item.color}>{item.icon}</span>
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* File Selector Dropdown */}
      <Select value={currentFile} onValueChange={(value) => onAction('open-file', value)}>
        <SelectTrigger className="h-8 max-w-[150px] text-xs">
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
          {recentFiles.length > 0 && (
            <>
              <DropdownMenuLabel className="px-2 py-1 text-xs text-gray-400">
                Recent Files
              </DropdownMenuLabel>
              {recentFiles.map((file) => (
                <SelectItem key={file.id} value={file.path} className="text-xs">
                  <div className="flex items-center space-x-2 w-full">
                    <FileText className="h-3 w-3 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{file.path.split('/').pop()}</div>
                      <div className="truncate text-gray-400 text-xs">{file.path}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => onAction('browse-files')}
            className="text-xs text-blue-400"
          >
            <Folder className="h-3 w-3 mr-2" />
            Browse All Files
          </DropdownMenuItem>
        </SelectContent>
      </Select>

      {/* View Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <Settings className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel>View Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {viewMenuItems.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => onAction(item.action)}
              className="flex items-center space-x-2 text-sm"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.action === 'toggle-file-tree' && (
                <Badge variant={isFileTreeOpen ? "default" : "outline"} className="ml-auto text-xs">
                  {isFileTreeOpen ? "On" : "Off"}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* File Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>File Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {fileActions.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => onAction(item.action)}
              className="flex items-center space-x-2 text-sm"
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Indicators */}
      <div className="flex items-center space-x-2 ml-auto">
        {currentFile && (
          <Badge variant="outline" className="text-xs h-6">
            <FileText className="h-2 w-2 mr-1" />
            1 file
          </Badge>
        )}
      </div>
    </div>
  );
}

// Compact AI Assistant Dropdown for Mobile
export function CompactAIDropdown({ onAction, suggestions = [], isActive = false }: {
  onAction: (action: string, data?: any) => void;
  suggestions?: any[];
  isActive?: boolean;
}) {
  const aiActions = [
    { label: "Explain Code", icon: <FileText className="h-4 w-4" />, action: "ai-explain" },
    { label: "Find Bugs", icon: <Bug className="h-4 w-4" />, action: "ai-debug" },
    { label: "Add Tests", icon: <TestTube className="h-4 w-4" />, action: "ai-test" },
    { label: "Optimize", icon: <Code className="h-4 w-4" />, action: "ai-optimize" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={isActive ? "default" : "ghost"} 
          size="sm" 
          className="h-8 relative"
        >
          <Code className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">AI</span>
          {suggestions.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-blue-600">
              {suggestions.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>AI Assistant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {suggestions.length > 0 && (
          <>
            <DropdownMenuItem
              onClick={() => onAction('ai-show-suggestions')}
              className="text-blue-400"
            >
              <Badge className="mr-2 h-4 w-4 p-0 text-xs">{suggestions.length}</Badge>
              View Suggestions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {aiActions.map((item) => (
          <DropdownMenuItem
            key={item.action}
            onClick={() => onAction(item.action)}
            className="flex items-center space-x-2 text-sm"
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction('ai-chat')}
          className="text-green-400"
        >
          <Code className="h-4 w-4 mr-2" />
          Open Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}