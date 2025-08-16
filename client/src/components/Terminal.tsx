import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Terminal as TerminalIcon } from "lucide-react";

interface TerminalOutput {
  id: string;
  text: string;
  type: "command" | "output" | "error";
}

export default function Terminal() {
  const [output, setOutput] = useState<TerminalOutput[]>([
    {
      id: "1",
      text: "johndoe@githv:~/my-awesome-project$ npm start",
      type: "command"
    },
    {
      id: "2", 
      text: "✓ Starting development server...",
      type: "output"
    },
    {
      id: "3",
      text: "Local: http://localhost:3000",
      type: "output"
    },
    {
      id: "4",
      text: "webpack compiled successfully",
      type: "output"
    }
  ]);
  
  const [currentCommand, setCurrentCommand] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommand = (command: string) => {
    const newOutput = [...output];
    
    // Add the command to output
    newOutput.push({
      id: Date.now().toString(),
      text: `johndoe@githv:~/my-awesome-project$ ${command}`,
      type: "command"
    });

    // Simulate command execution
    switch (command.trim()) {
      case "clear":
        setOutput([]);
        return;
      case "ls":
        newOutput.push({
          id: (Date.now() + 1).toString(),
          text: "src  package.json  README.md  node_modules",
          type: "output"
        });
        break;
      case "pwd":
        newOutput.push({
          id: (Date.now() + 1).toString(),
          text: "/home/johndoe/my-awesome-project",
          type: "output"
        });
        break;
      case "git status":
        newOutput.push({
          id: (Date.now() + 1).toString(),
          text: "On branch main\nChanges not staged for commit:\n  modified:   src/components/App.js\n  new file:   src/utils/helpers.js",
          type: "output"
        });
        break;
      default:
        if (command.trim()) {
          newOutput.push({
            id: (Date.now() + 1).toString(),
            text: `bash: ${command}: command not found`,
            type: "error"
          });
        }
    }

    setOutput(newOutput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(currentCommand);
      setCurrentCommand("");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="border-t border-dark-border bg-dark-surface" style={{ height: "200px" }}>
      <Tabs defaultValue="terminal" className="h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="terminal" 
              className="px-3 py-1 bg-dark-bg rounded text-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400"
            >
              Terminal
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="px-3 py-1 hover:bg-dark-bg rounded text-sm text-gray-400"
            >
              Problems
            </TabsTrigger>
            <TabsTrigger 
              value="output" 
              className="px-3 py-1 hover:bg-dark-bg rounded text-sm text-gray-400"
            >
              Output
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-dark-bg"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <TabsContent value="terminal" className="h-full m-0 p-4">
          <div className="h-full flex flex-col font-mono text-sm">
            <ScrollArea ref={scrollRef} className="flex-1 pr-4">
              {output.map((line) => (
                <div
                  key={line.id}
                  className={`mb-1 ${
                    line.type === "command" 
                      ? "text-gray-400" 
                      : line.type === "error" 
                      ? "text-red-400" 
                      : line.type === "output" && line.text.includes("✓")
                      ? "text-green-400"
                      : line.type === "output" && line.text.includes("Local:")
                      ? "text-blue-400"
                      : "text-gray-300"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {line.text}
                </div>
              ))}
            </ScrollArea>
            <div className="flex items-center mt-2">
              <span className="text-gray-400">johndoe@githv:~/my-awesome-project$</span>
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                className="ml-2 bg-transparent border-none outline-none text-dark-text flex-1"
                placeholder=""
                autoFocus
              />
              <div className="w-2 h-5 bg-dark-text ml-1 animate-pulse" />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="problems" className="h-full m-0 p-4">
          <div className="text-gray-400 text-sm">No problems found</div>
        </TabsContent>
        
        <TabsContent value="output" className="h-full m-0 p-4">
          <div className="text-gray-400 text-sm">Output panel</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
