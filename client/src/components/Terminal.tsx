import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Terminal as TerminalIcon, Maximize2, Minimize2, Copy, Trash2 } from "lucide-react";

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export default function Terminal({ isOpen, onClose, theme = 'dark' }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'GitHV Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    
    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCommand]);
    setHistoryIndex(-1);
    
    // Add input line
    const inputLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      content: `$ ${trimmedCommand}`,
      timestamp: new Date()
    };
    
    setLines(prev => [...prev, inputLine]);
    
    // Process command
    let outputLines: TerminalLine[] = [];
    
    switch (trimmedCommand.toLowerCase()) {
      case 'help':
        outputLines = [
          {
            id: Date.now().toString() + '1',
            type: 'output',
            content: 'Available commands:',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '2',
            type: 'output',
            content: '  help     - Show this help message',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '3',
            type: 'output',
            content: '  clear    - Clear terminal',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '4',
            type: 'output',
            content: '  ls       - List files',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '5',
            type: 'output',
            content: '  pwd      - Show current directory',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '6',
            type: 'output',
            content: '  git      - Git commands',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '7',
            type: 'output',
            content: '  npm      - NPM commands',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '8',
            type: 'output',
            content: '  run      - Run current file',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'clear':
        setLines([]);
        return;
        
      case 'ls':
        outputLines = [
          {
            id: Date.now().toString(),
            type: 'output',
            content: 'src/  package.json  README.md  node_modules/  .gitignore',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'pwd':
        outputLines = [
          {
            id: Date.now().toString(),
            type: 'output',
            content: '/home/githv/project',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'git status':
        outputLines = [
          {
            id: Date.now().toString(),
            type: 'output',
            content: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'npm start':
        outputLines = [
          {
            id: Date.now().toString() + '1',
            type: 'output',
            content: '> githv@1.0.0 start',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '2',
            type: 'output',
            content: '> vite',
            timestamp: new Date()
          },
          {
            id: Date.now().toString() + '3',
            type: 'output',
            content: 'Server running at http://localhost:5173',
            timestamp: new Date()
          }
        ];
        break;
        
      case '':
        // Empty command, do nothing
        return;
        
      default:
        if (trimmedCommand.startsWith('echo ')) {
          outputLines = [
            {
              id: Date.now().toString(),
              type: 'output',
              content: trimmedCommand.substring(5),
              timestamp: new Date()
            }
          ];
        } else {
          outputLines = [
            {
              id: Date.now().toString(),
              type: 'error',
              content: `Command not found: ${trimmedCommand}`,
              timestamp: new Date()
            }
          ];
        }
    }
    
    setLines(prev => [...prev, ...outputLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const copyToClipboard = () => {
    const text = lines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${
        isMaximized ? 'fixed inset-0 z-50' : 'h-full'
      } ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } flex flex-col border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      {/* Terminal Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${
        theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0"
            title="Copy output"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLines([])}
            className="h-6 w-6 p-0"
            title="Clear terminal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-6 w-6 p-0"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
            title="Close terminal"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1 p-4 font-mono text-sm" ref={scrollRef}>
        <div className="space-y-1">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`${
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'input' ? 'text-blue-400' : 
                'text-inherit'
              }`}
            >
              {line.content.split('\n').map((text, i) => (
                <div key={i}>{text}</div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Terminal Input */}
      <div className={`flex items-center px-4 py-2 ${
        theme === 'dark' ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-50 border-t border-gray-200'
      }`}>
        <span className="text-blue-400 mr-2">$</span>
        <Input
          ref={inputRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}