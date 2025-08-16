import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Lightbulb, Zap } from "lucide-react";

interface CodeSuggestion {
  id: string;
  text: string;
  description: string;
  type: "function" | "variable" | "class" | "method" | "snippet";
  language: string;
}

interface CodeCompletionProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onSelect: (suggestion: CodeSuggestion) => void;
  onClose: () => void;
  currentLine: string;
  language: string;
}

export default function CodeCompletion({ 
  isVisible, 
  position, 
  onSelect, 
  onClose, 
  currentLine, 
  language 
}: CodeCompletionProps) {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Generate AI-powered suggestions based on current context
    const generateSuggestions = () => {
      const contextSuggestions: CodeSuggestion[] = [];
      
      if (language === "typescript" || language === "javascript") {
        if (currentLine.includes("const ") || currentLine.includes("let ")) {
          contextSuggestions.push({
            id: "1",
            text: "useState",
            description: "React hook for state management",
            type: "function",
            language
          });
          contextSuggestions.push({
            id: "2", 
            text: "useEffect",
            description: "React hook for side effects",
            type: "function",
            language
          });
        }
        
        if (currentLine.includes("function ") || currentLine.includes("=>")) {
          contextSuggestions.push({
            id: "3",
            text: "async/await pattern",
            description: "Asynchronous function template",
            type: "snippet",
            language
          });
        }
      }

      // Add common completions
      contextSuggestions.push(
        {
          id: "4",
          text: "console.log",
          description: "Log output to console",
          type: "method",
          language
        },
        {
          id: "5", 
          text: "try/catch",
          description: "Error handling block",
          type: "snippet",
          language
        }
      );

      setSuggestions(contextSuggestions);
    };

    generateSuggestions();
  }, [currentLine, language, isVisible]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "function":
        return <Code className="h-3 w-3 text-blue-400" />;
      case "snippet":
        return <Lightbulb className="h-3 w-3 text-yellow-400" />;
      default:
        return <Zap className="h-3 w-3 text-green-400" />;
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <Card
      ref={cardRef}
      className="absolute bg-dark-surface border-dark-border shadow-lg z-50 max-w-sm"
      style={{ 
        left: position.x, 
        top: position.y,
        maxHeight: "200px",
        overflowY: "auto"
      }}
    >
      <div className="p-2">
        <div className="text-xs text-gray-400 mb-2 flex items-center">
          <Lightbulb className="h-3 w-3 mr-1" />
          AI Suggestions
        </div>
        {suggestions.map((suggestion, index) => (
          <Button
            key={suggestion.id}
            variant="ghost"
            className={`w-full justify-start p-2 h-auto text-left ${
              index === selectedIndex ? "bg-dark-bg" : ""
            }`}
            onClick={() => onSelect(suggestion)}
          >
            <div className="flex items-start space-x-2 w-full">
              {getTypeIcon(suggestion.type)}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-dark-text truncate">
                  {suggestion.text}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {suggestion.description}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {suggestion.type}
              </Badge>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}