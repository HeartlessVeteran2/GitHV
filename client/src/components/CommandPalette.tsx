import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, GitCommit, FileText, Terminal } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
}

const commands: Command[] = [
  {
    id: "git-commit",
    title: "Git: Commit",
    description: "Create a new commit",
    action: "git.commit",
    icon: <GitCommit className="h-4 w-4" />
  },
  {
    id: "file-new",
    title: "File: New File",
    description: "Create a new file",
    action: "file.new",
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: "terminal-clear",
    title: "Terminal: Clear",
    description: "Clear terminal output",
    action: "terminal.clear",
    icon: <Terminal className="h-4 w-4" />
  },
  {
    id: "git-push",
    title: "Git: Push",
    description: "Push changes to remote repository",
    action: "git.push",
    icon: <GitCommit className="h-4 w-4" />
  }
];

export default function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onCommand(filteredCommands[selectedIndex].action);
          onClose();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-surface border-dark-border max-w-2xl p-0">
        <div className="p-4 border-b border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Type a command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-dark-bg border-dark-border text-dark-text"
              autoFocus
            />
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {filteredCommands.map((command, index) => (
              <Button
                key={command.id}
                variant="ghost"
                className={`w-full justify-start p-3 h-auto ${
                  index === selectedIndex ? 'bg-dark-bg' : ''
                }`}
                onClick={() => {
                  onCommand(command.action);
                  onClose();
                }}
              >
                <div className="flex items-center space-x-3">
                  {command.icon}
                  <div className="text-left">
                    <div className="font-medium text-sm">{command.title}</div>
                    <div className="text-gray-400 text-xs">{command.description}</div>
                  </div>
                </div>
              </Button>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No commands found
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
