import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, File, Folder, Code } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { File as FileType, Repository } from "@shared/schema";

interface SearchResult {
  id: string;
  type: "file" | "content" | "folder";
  path: string;
  content?: string;
  lineNumber?: number;
  repository: Repository;
  score: number;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: FileType) => void;
  repositories: Repository[];
}

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  repositories 
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchType, setSearchType] = useState<"files" | "content">("files");

  const { data: allFiles = [] } = useQuery<FileType[]>({
    queryKey: ["/api/files/search", repositories.map(r => r.id)],
    enabled: isOpen && repositories.length > 0,
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = () => {
      const results: SearchResult[] = [];
      const term = searchTerm.toLowerCase();

      allFiles.forEach(file => {
        const repository = repositories.find(r => r.id === file.repositoryId);
        if (!repository) return;

        // File name search
        if (searchType === "files" && file.path.toLowerCase().includes(term)) {
          const score = calculateScore(file.path, term);
          results.push({
            id: `file-${file.id}`,
            type: "file",
            path: file.path,
            repository,
            score
          });
        }

        // Content search
        if (searchType === "content" && file.content?.toLowerCase().includes(term)) {
          const lines = file.content.split('\n');
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(term)) {
              results.push({
                id: `content-${file.id}-${index}`,
                type: "content",
                path: file.path,
                content: line.trim(),
                lineNumber: index + 1,
                repository,
                score: calculateScore(line, term)
              });
            }
          });
        }
      });

      // Sort by score (higher is better)
      results.sort((a, b) => b.score - a.score);
      setSearchResults(results.slice(0, 50)); // Limit results
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchType, allFiles, repositories]);

  const calculateScore = (text: string, term: string): number => {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    
    if (lowerText === lowerTerm) return 100;
    if (lowerText.startsWith(lowerTerm)) return 90;
    if (lowerText.includes(lowerTerm)) return 70;
    
    // Fuzzy matching score
    let score = 0;
    let termIndex = 0;
    
    for (let i = 0; i < lowerText.length && termIndex < lowerTerm.length; i++) {
      if (lowerText[i] === lowerTerm[termIndex]) {
        score += 10;
        termIndex++;
      }
    }
    
    return termIndex === lowerTerm.length ? score : 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultSelect(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    const file = allFiles.find(f => f.repositoryId === result.repository.id && f.path === result.path);
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "file":
        return <File className="h-4 w-4 text-blue-400" />;
      case "content":
        return <Code className="h-4 w-4 text-green-400" />;
      case "folder":
        return <Folder className="h-4 w-4 text-yellow-400" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-surface border-dark-border max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files and content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-dark-bg border-dark-border"
                autoFocus
              />
            </div>
            <Button
              variant={searchType === "files" ? "default" : "outline"}
              onClick={() => setSearchType("files")}
              className="px-4"
            >
              Files
            </Button>
            <Button
              variant={searchType === "content" ? "default" : "outline"}
              onClick={() => setSearchType("content")}
              className="px-4"
            >
              Content
            </Button>
          </div>

          {/* Search Results */}
          <ScrollArea className="max-h-96">
            <div className="space-y-1">
              {searchResults.map((result, index) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto text-left ${
                    index === selectedIndex ? "bg-dark-bg" : ""
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.path}
                      </div>
                      {result.content && (
                        <div className="text-xs text-gray-400 font-mono mt-1 truncate">
                          {result.lineNumber && (
                            <span className="text-yellow-400 mr-2">
                              Line {result.lineNumber}:
                            </span>
                          )}
                          {result.content}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {result.repository.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(result.score)}%
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
              
              {searchTerm && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No results found for "{searchTerm}"
                </div>
              )}
              
              {!searchTerm && (
                <div className="text-center py-8 text-gray-400">
                  Start typing to search across all files and content
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}