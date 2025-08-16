import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { 
  Search, 
  File, 
  GitBranch, 
  Terminal, 
  Settings, 
  Play,
  Save,
  Folder,
  Code,
  Zap,
  Mic,
  Eye
} from "lucide-react";

interface CommandAction {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: string;
  keywords: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onFileOpen: (path: string) => void;
  onGitAction: (action: string) => void;
  onTerminalOpen: () => void;
  onSettingsOpen: () => void;
  onSave: () => void;
  onRun: () => void;
  onSearch: () => void;
  onVoiceCommand: () => void;
  onPreviewToggle: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onFileOpen,
  onGitAction,
  onTerminalOpen,
  onSettingsOpen,
  onSave,
  onRun,
  onSearch,
  onVoiceCommand,
  onPreviewToggle
}: CommandPaletteProps) {
  const [searchValue, setSearchValue] = useState("");

  const commands: CommandAction[] = [
    // File operations
    {
      id: "file-save",
      title: "Save File",
      subtitle: "Save the current file",
      icon: Save,
      action: onSave,
      category: "File",
      keywords: ["save", "write", "persist"],
      shortcut: "⌘ S"
    },
    {
      id: "file-search",
      title: "Global Search",
      subtitle: "Search across all files",
      icon: Search,
      action: onSearch,
      category: "File",
      keywords: ["search", "find", "grep"],
      shortcut: "⌘ F"
    },
    {
      id: "file-new",
      title: "New File",
      subtitle: "Create a new file",
      icon: File,
      action: () => onFileOpen("untitled"),
      category: "File",
      keywords: ["new", "create", "file"],
      shortcut: "⌘ N"
    },
    
    // Git operations
    {
      id: "git-status",
      title: "Git Status",
      subtitle: "View repository status",
      icon: GitBranch,
      action: () => onGitAction("status"),
      category: "Git",
      keywords: ["git", "status", "changes"],
      shortcut: "⌘ G S"
    },
    {
      id: "git-commit",
      title: "Git Commit",
      subtitle: "Commit changes",
      icon: GitBranch,
      action: () => onGitAction("commit"),
      category: "Git",
      keywords: ["git", "commit", "save"],
      shortcut: "⌘ G C"
    },
    {
      id: "git-branch",
      title: "Switch Branch",
      subtitle: "Change active branch",
      icon: GitBranch,
      action: () => onGitAction("branch"),
      category: "Git",
      keywords: ["git", "branch", "switch", "checkout"]
    },
    {
      id: "git-pull",
      title: "Git Pull",
      subtitle: "Pull latest changes",
      icon: GitBranch,
      action: () => onGitAction("pull"),
      category: "Git",
      keywords: ["git", "pull", "fetch", "sync"]
    },
    {
      id: "git-push",
      title: "Git Push",
      subtitle: "Push changes to remote",
      icon: GitBranch,
      action: () => onGitAction("push"),
      category: "Git",
      keywords: ["git", "push", "upload", "sync"]
    },
    
    // Development operations
    {
      id: "dev-run",
      title: "Run Code",
      subtitle: "Execute the current file or project",
      icon: Play,
      action: onRun,
      category: "Development",
      keywords: ["run", "execute", "start", "launch"],
      shortcut: "⌘ R"
    },
    {
      id: "dev-terminal",
      title: "Open Terminal",
      subtitle: "Open integrated terminal",
      icon: Terminal,
      action: onTerminalOpen,
      category: "Development",
      keywords: ["terminal", "console", "shell", "cmd"],
      shortcut: "⌘ `"
    },
    {
      id: "dev-preview",
      title: "Toggle Preview",
      subtitle: "Show/hide preview pane",
      icon: Eye,
      action: onPreviewToggle,
      category: "Development",
      keywords: ["preview", "view", "show", "render"],
      shortcut: "⌘ P"
    },
    
    // AI and Voice
    {
      id: "ai-voice",
      title: "Voice Command",
      subtitle: "Start voice input",
      icon: Mic,
      action: onVoiceCommand,
      category: "AI",
      keywords: ["voice", "speak", "ai", "assistant"],
      shortcut: "⌘ ⇧ V"
    },
    {
      id: "ai-complete",
      title: "Code Completion",
      subtitle: "Trigger AI code completion",
      icon: Zap,
      action: () => {/* Trigger completion */},
      category: "AI",
      keywords: ["complete", "ai", "suggest", "auto"],
      shortcut: "Ctrl Space"
    },
    
    // Settings
    {
      id: "settings-open",
      title: "Open Settings",
      subtitle: "Configure application settings",
      icon: Settings,
      action: onSettingsOpen,
      category: "Settings",
      keywords: ["settings", "config", "preferences"],
      shortcut: "⌘ ,"
    }
  ];

  const filteredCommands = commands.filter(command => {
    if (!searchValue) return true;
    
    const searchLower = searchValue.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.subtitle?.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      command.category.toLowerCase().includes(searchLower)
    );
  });

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, CommandAction[]>);

  const handleCommandSelect = (command: CommandAction) => {
    command.action();
    onClose();
    setSearchValue("");
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
    }
  }, [isOpen]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (!isOpen) {
          // onOpen would be called by parent
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchValue}
        onValueChange={setSearchValue}
        className="border-dark-border"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <CommandGroup key={category} heading={category}>
            {categoryCommands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => handleCommandSelect(command)}
                className="flex items-center space-x-3 p-3 cursor-pointer"
              >
                <command.icon className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{command.title}</div>
                  {command.subtitle && (
                    <div className="text-xs text-gray-400">{command.subtitle}</div>
                  )}
                </div>
                {command.shortcut && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {command.shortcut}
                  </Badge>
                )}
              </CommandItem>
            ))}
            <CommandSeparator />
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}