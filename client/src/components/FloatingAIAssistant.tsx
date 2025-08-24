import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequestJson } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Sparkles, X, MessageSquare, Lightbulb,
  Zap, TestTube, Bug, FileText,
  Send, Minimize2, Maximize2, Copy, Check, Settings
} from "lucide-react";
import PersonalitySelector, { personalities, type AIPersonality } from "./PersonalitySelector";
import AITips from "./AITips";
import AITooltip, { useAITooltips } from "./AITooltip";

interface FloatingAIAssistantProps {
  code: string;
  language: string;
  fileName?: string;
  cursorPosition?: number;
  selectedText?: string;
  onCodeInsert: (code: string) => void;
  onCodeReplace: (code: string) => void;
}

interface Suggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'optimize' | 'explain';
  title: string;
  description: string;
  code?: string;
  confidence: number;
  action: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingAIAssistant({
  code,
  language,
  fileName,
  cursorPosition,
  selectedText,
  onCodeInsert,
  onCodeReplace
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality>(personalities[0]);
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { tooltips, showTooltip, hideTooltip, hideAllTooltips } = useAITooltips();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  // Auto-generate suggestions based on context
  const suggestionsMutation = useMutation({
    mutationFn: async (): Promise<{ suggestions: Suggestion[] }> => {
      return apiRequestJson("POST", "/api/ai/code-suggestions", {
        code,
        language,
        fileName,
        cursorPosition,
        selectedText,
        personality: currentPersonality.prompt
      });
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      if (data.suggestions?.length > 0 && !isOpen) {
        setIsOpen(true);
        setActiveTab('suggestions');
        // Show tooltip for first-time users
        setTimeout(() => {
          const suggestionElement = document.querySelector('.suggestion-item');
          showContextTooltip('first-suggestion', suggestionElement as HTMLElement);
        }, 500);
      }
    }
  });

  // Chat with AI
  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<{ response: string }> => {
      return apiRequestJson("POST", "/api/ai/chat", {
        message,
        code,
        language,
        fileName,
        history: chatMessages,
        personality: currentPersonality.prompt
      });
    },
    onSuccess: (data) => {
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: chatInput, timestamp: new Date() },
        { role: 'assistant', content: data.response, timestamp: new Date() }
      ]);
      setChatInput("");
    }
  });

  // Context-aware trigger for suggestions
  useEffect(() => {
    if (!code || code.length < 20) return;

    const contextTriggers = [
      // Function definitions
      /function\s+\w+\s*\([^)]*\)\s*{?\s*$/,
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{?\s*$/,
      // Error patterns
      /\.then\s*\(\s*$/,
      /\.catch\s*\(\s*$/,
      // Import statements
      /import\s+.*from\s+['"][^'"]*$/,
      // Console or logging
      /console\.\w+\s*\(\s*$/,
      // Comments indicating TODOs
      /\/\/\s*TODO:/i,
      /\/\/\s*FIXME:/i,
      // Class definitions
      /class\s+\w+\s*{?\s*$/,
      // Loop structures
      /for\s*\([^)]*\)\s*{?\s*$/,
      /while\s*\([^)]*\)\s*{?\s*$/
    ];

    const shouldTrigger = contextTriggers.some(pattern => 
      pattern.test(code.slice(-100)) // Check last 100 characters
    );

    if (shouldTrigger || selectedText) {
      const timer = setTimeout(() => {
        suggestionsMutation.mutate();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [code, selectedText, cursorPosition]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Show welcome tips on first use
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('ai-assistant-welcome');
    if (!hasSeenWelcome && isOpen && !hasShownWelcome) {
      setShowTips(true);
      setHasShownWelcome(true);
      localStorage.setItem('ai-assistant-welcome', 'true');
    }
  }, [isOpen, hasShownWelcome]);

  // Show contextual tooltips based on user actions
  const showContextTooltip = (type: string, element?: HTMLElement) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top,
      placement: 'top' as const
    };

    const tooltipData = {
      'first-suggestion': {
        id: 'first-suggestion',
        position,
        title: 'AI Suggestion Available',
        content: 'Your AI assistant has analyzed your code and found helpful suggestions. Click on any suggestion to learn more or apply it.',
        type: 'tip' as const,
        duration: 5000
      },
      'personality-changed': {
        id: 'personality-changed',
        position,
        title: 'Personality Updated',
        content: 'Your AI assistant personality has been changed. You\'ll notice different communication styles and approaches.',
        type: 'success' as const,
        duration: 3000
      },
      'no-suggestions': {
        id: 'no-suggestions',
        position,
        title: 'Need Help?',
        content: 'Try using the quick action buttons to get specific suggestions, or switch to chat mode to ask questions.',
        type: 'info' as const,
        actionText: 'Show Tips',
        onAction: () => setShowTips(true)
      }
    };

    const tooltip = tooltipData[type as keyof typeof tooltipData];
    if (tooltip) {
      showTooltip(tooltip);
    }
  };

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 360, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const applySuggestion = (suggestion: Suggestion) => {
    if (suggestion.code) {
      if (selectedText) {
        onCodeReplace(suggestion.code);
      } else {
        onCodeInsert(suggestion.code);
      }
    }
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const copySuggestion = (suggestion: Suggestion) => {
    if (suggestion.code) {
      navigator.clipboard.writeText(suggestion.code);
      setCopiedSuggestion(suggestion.id);
      setTimeout(() => setCopiedSuggestion(null), 2000);
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      chatMutation.mutate(chatInput);
    }
  };

  const quickActions = [
    {
      label: "Explain this code",
      icon: <FileText className="h-3 w-3" />,
      action: () => {
        setChatInput("Explain what this code does");
        setActiveTab('chat');
      }
    },
    {
      label: "Find bugs",
      icon: <Bug className="h-3 w-3" />,
      action: () => {
        setChatInput("Find potential bugs or issues in this code");
        setActiveTab('chat');
      }
    },
    {
      label: "Optimize",
      icon: <Zap className="h-3 w-3" />,
      action: () => {
        setChatInput("How can I optimize this code for better performance?");
        setActiveTab('chat');
      }
    },
    {
      label: "Add tests",
      icon: <TestTube className="h-3 w-3" />,
      action: () => {
        setChatInput("Generate unit tests for this code");
        setActiveTab('chat');
      }
    }
  ];

  if (!isOpen) {
    // Floating bubble when closed
    return (
      <div
        className="fixed z-50 cursor-pointer"
        style={{ left: position.x + 320, top: position.y }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <Bot className="h-5 w-5" />
        </Button>
        
        {suggestions.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
            {suggestions.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div
      ref={assistantRef}
      className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? '280px' : '360px',
        height: isMinimized ? '60px' : '500px'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-gray-800 rounded-t-lg cursor-move border-b border-gray-700 ai-assistant-header"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${currentPersonality.color} text-white`}>
            {currentPersonality.icon}
          </div>
          <div>
            <span className="font-medium text-white text-sm">{currentPersonality.name}</span>
            <Badge variant="outline" className="text-xs ml-2">
              <Sparkles className="h-2 w-2 mr-1" />
              Live
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPersonalitySelector(true)}
            className="h-6 w-6 p-0"
            title="Change personality"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tab Navigation */}
          <div className="flex bg-gray-800 border-b border-gray-700">
            <button
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('suggestions')}
            >
              <Lightbulb className="h-3 w-3 mr-1 inline" />
              Suggestions
              {suggestions.length > 0 && (
                <Badge className="ml-1 text-xs bg-blue-600">{suggestions.length}</Badge>
              )}
            </button>
            <button
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="h-3 w-3 mr-1 inline" />
              Chat
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 h-96">
            {activeTab === 'suggestions' && (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 p-3">
                  {suggestionsMutation.isPending && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-xs text-gray-400">Analyzing...</span>
                    </div>
                  )}

                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${
                                  suggestion.type === 'completion' ? 'bg-green-500' :
                                  suggestion.type === 'refactor' ? 'bg-blue-500' :
                                  suggestion.type === 'fix' ? 'bg-red-500' :
                                  suggestion.type === 'optimize' ? 'bg-yellow-500' : 'bg-purple-500'
                                }`} />
                                <span className="text-xs font-medium text-white">
                                  {suggestion.title}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-400 mb-2">
                              {suggestion.description}
                            </p>
                            
                            {suggestion.code && (
                              <div className="bg-black rounded p-2 mb-2">
                                <code className="text-xs text-green-400 font-mono block overflow-x-auto">
                                  {suggestion.code.length > 80 
                                    ? suggestion.code.substring(0, 80) + '...'
                                    : suggestion.code
                                  }
                                </code>
                              </div>
                            )}
                            
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={() => applySuggestion(suggestion)}
                              >
                                <Check className="h-2 w-2 mr-1" />
                                Apply
                              </Button>
                              {suggestion.code && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0"
                                  onClick={() => copySuggestion(suggestion)}
                                >
                                  {copiedSuggestion === suggestion.id ? 
                                    <Check className="h-2 w-2 text-green-500" /> : 
                                    <Copy className="h-2 w-2" />
                                  }
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-xs text-gray-400 mb-3">No suggestions yet</p>
                      <div className="grid grid-cols-2 gap-1">
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={action.action}
                            title={`Ask AI to ${action.label.toLowerCase()}`}
                          >
                            {action.icon}
                            <span className="ml-1 hidden sm:inline">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs mt-3"
                        onClick={() => setShowTips(true)}
                        title="Show AI assistant tips and tutorials"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Need Help?
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 p-3">
                  {chatMessages.length > 0 ? (
                    <div className="space-y-2">
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded text-xs ${
                            msg.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-gray-200'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-xs text-gray-400 mb-3">Ask me anything about your code</p>
                      <div className="space-y-1">
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-8 justify-start"
                            onClick={action.action}
                          >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your code..."
                      className="flex-1 h-8 text-xs"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSubmit();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || chatMutation.isPending}
                      className="h-8 w-8 p-0"
                    >
                      {chatMutation.isPending ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Personality Selector Modal */}
      <PersonalitySelector
        currentPersonality={currentPersonality.id}
        onPersonalityChange={(personality) => {
          setCurrentPersonality(personality);
          setShowPersonalitySelector(false);
          // Add a welcome message from the new personality
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: `Hi! I'm your ${personality.name} assistant. ${personality.description} How can I help you with your code today?`,
            timestamp: new Date()
          }]);
          // Show personality change tooltip
          setTimeout(() => {
            const headerElement = document.querySelector('.ai-assistant-header');
            showContextTooltip('personality-changed', headerElement as HTMLElement);
          }, 500);
        }}
        isOpen={showPersonalitySelector}
        onClose={() => setShowPersonalitySelector(false)}
      />

      {/* AI Tips Modal */}
      <AITips
        isOpen={showTips}
        onClose={() => setShowTips(false)}
        onTipComplete={(tipId) => {
          console.log(`Tip completed: ${tipId}`);
        }}
      />

      {/* Active Tooltips */}
      {tooltips.map((tooltip) => (
        <AITooltip key={tooltip.id} {...tooltip} />
      ))}
    </div>
  );
}