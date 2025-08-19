import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Kbd } from '@/components/ui/kbd';
import {
  Search, FileCode, Folder, Settings, Terminal,
  Command as CommandIcon, ArrowRight, Clock, Star,
  Github, GitBranch, Play, Bug, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Repository, File as FileType } from '@shared/schema';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'file' | 'folder' | 'command' | 'repository' | 'recent';
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  score?: number;
}

interface SmartSearchBarProps {
  currentRepository: Repository | null;
  onFileSelect: (file: FileType) => void;
  onCommand: (command: string) => void;
  className?: string;
}

const commands = [
  { id: 'file.new', title: 'New File', icon: <FileCode className="h-4 w-4" />, keywords: ['new', 'create', 'file'] },
  { id: 'folder.new', title: 'New Folder', icon: <Folder className="h-4 w-4" />, keywords: ['new', 'create', 'folder', 'directory'] },
  { id: 'file.save', title: 'Save File', icon: <FileCode className="h-4 w-4" />, keywords: ['save', 'write'] },
  { id: 'file.save-all', title: 'Save All Files', icon: <FileCode className="h-4 w-4" />, keywords: ['save', 'all', 'write'] },
  { id: 'terminal.new', title: 'New Terminal', icon: <Terminal className="h-4 w-4" />, keywords: ['terminal', 'console', 'shell'] },
  { id: 'terminal.clear', title: 'Clear Terminal', icon: <Terminal className="h-4 w-4" />, keywords: ['terminal', 'clear', 'clean'] },
  { id: 'git.commit', title: 'Git Commit', icon: <GitBranch className="h-4 w-4" />, keywords: ['git', 'commit', 'save'] },
  { id: 'git.push', title: 'Git Push', icon: <Github className="h-4 w-4" />, keywords: ['git', 'push', 'upload'] },
  { id: 'git.pull', title: 'Git Pull', icon: <Github className="h-4 w-4" />, keywords: ['git', 'pull', 'fetch'] },
  { id: 'run.file', title: 'Run Current File', icon: <Play className="h-4 w-4" />, keywords: ['run', 'execute', 'play'] },
  { id: 'debug.start', title: 'Start Debugging', icon: <Bug className="h-4 w-4" />, keywords: ['debug', 'breakpoint'] },
  { id: 'format.document', title: 'Format Document', icon: <Zap className="h-4 w-4" />, keywords: ['format', 'prettier', 'style'] },
  { id: 'settings.open', title: 'Open Settings', icon: <Settings className="h-4 w-4" />, keywords: ['settings', 'preferences', 'config'] },
];

export default function SmartSearchBar({
  currentRepository,
  onFileSelect,
  onCommand,
  className
}: SmartSearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: files = [] } = useQuery<FileType[]>({
    queryKey: ["/api/repositories", currentRepository?.id, "files"],
    enabled: !!currentRepository?.id,
  });

  const { data: repositories = [] } = useQuery<Repository[]>({
    queryKey: ["/api/repositories"],
  });

  // Load recent files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
      setRecentFiles(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const addToRecentFiles = (fileId: string) => {
    const updated = [fileId, ...recentFiles.filter(id => id !== fileId)].slice(0, 10);
    setRecentFiles(updated);
    localStorage.setItem('recentFiles', JSON.stringify(updated));
  };

  const searchResults: SearchResult[] = (() => {
    if (!query) {
      // Show recent files when no query
      const recent = recentFiles
        .map(fileId => files.find(f => f.id === fileId))
        .filter(Boolean)
        .slice(0, 5)
        .map(file => ({
          id: file!.id,
          title: file!.path.split('/').pop() || file!.path,
          subtitle: file!.path,
          type: 'recent' as const,
          icon: <Clock className="h-4 w-4 text-gray-400" />,
          action: () => {
            onFileSelect(file!);
            setOpen(false);
          }
        }));

      return recent;
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search files
    files.forEach(file => {
      const fileName = file.path.split('/').pop() || file.path;
      const score = fileName.toLowerCase().includes(lowerQuery) ? 1 : 
                   file.path.toLowerCase().includes(lowerQuery) ? 0.8 : 0;
      
      if (score > 0) {
        results.push({
          id: file.id,
          title: fileName,
          subtitle: file.path,
          type: 'file',
          icon: <FileCode className="h-4 w-4 text-blue-400" />,
          action: () => {
            onFileSelect(file);
            addToRecentFiles(file.id);
            setOpen(false);
          },
          score
        });
      }
    });

    // Search commands
    commands.forEach(command => {
      const titleMatch = command.title.toLowerCase().includes(lowerQuery);
      const keywordMatch = command.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      if (titleMatch || keywordMatch) {
        results.push({
          id: command.id,
          title: command.title,
          type: 'command',
          icon: command.icon,
          action: () => {
            onCommand(command.id);
            setOpen(false);
          },
          score: titleMatch ? 1 : 0.7
        });
      }
    });

    // Search repositories
    repositories.forEach(repo => {
      if (repo.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: repo.id,
          title: repo.name,
          subtitle: repo.description || 'Repository',
          type: 'repository',
          icon: <Github className="h-4 w-4 text-green-400" />,
          action: () => {
            // Switch repository action would go here
            setOpen(false);
          },
          score: 0.9
        });
      }
    });

    // Sort by score and return top results
    return results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
  })();

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'file':
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case 'folder':
        return <Folder className="h-4 w-4 text-yellow-400" />;
      case 'command':
        return <CommandIcon className="h-4 w-4 text-purple-400" />;
      case 'repository':
        return <Github className="h-4 w-4 text-green-400" />;
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    switch (type) {
      case 'file':
        return <Badge variant="outline" className="text-xs">File</Badge>;
      case 'command':
        return <Badge variant="outline" className="text-xs">Command</Badge>;
      case 'repository':
        return <Badge variant="outline" className="text-xs">Repo</Badge>;
      case 'recent':
        return <Badge variant="outline" className="text-xs">Recent</Badge>;
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-sm font-normal",
            className
          )}
        >
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Search files, commands...</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <span className="bg-gray-700 px-1 rounded">⌘</span>
            <span className="bg-gray-700 px-1 rounded">K</span>
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder="Search files, commands, and more..."
            value={query}
            onValueChange={setQuery}
            className="border-0"
          />
          
          <CommandList>
            {searchResults.length === 0 ? (
              <CommandEmpty>
                {query ? 'No results found.' : 'Start typing to search...'}
              </CommandEmpty>
            ) : (
              <>
                {!query && searchResults.length > 0 && (
                  <CommandGroup heading="Recent Files">
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={result.action}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-3">
                          {result.icon}
                          <div className="flex flex-col">
                            <span className="font-medium">{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-gray-400">{result.subtitle}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(result.type)}
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {query && (
                  <CommandGroup heading="Search Results">
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={result.action}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-3">
                          {result.icon}
                          <div className="flex flex-col">
                            <span className="font-medium">{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-gray-400">{result.subtitle}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(result.type)}
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}