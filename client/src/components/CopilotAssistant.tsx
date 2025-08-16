import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Code, FileText, TestTube, RefreshCw, Lightbulb,
  Zap, MessageSquare, Settings, Check, X, Play,
  GitBranch, Bug, Sparkles, Brain, Target
} from "lucide-react";

interface CopilotAssistantProps {
  code: string;
  language: string;
  fileName?: string;
  onCodeChange: (code: string) => void;
  onInsertCode: (code: string, position?: number) => void;
}

interface Suggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'optimize';
  title: string;
  description: string;
  code: string;
  confidence: number;
  startLine?: number;
  endLine?: number;
}

export default function CopilotAssistant({ 
  code, 
  language, 
  fileName, 
  onCodeChange, 
  onInsertCode 
}: CopilotAssistantProps) {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate suggestions when code changes
  const suggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/code-suggestions", {
        code,
        language,
        fileName,
        cursorPosition,
        selectedText
      });
      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
    }
  });

  // Chat with AI assistant
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        code,
        language,
        fileName,
        history: chatHistory
      });
      return response;
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: data.response }
      ]);
      setChatInput("");
    }
  });

  // Code analysis
  const { data: analysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ["/api/ai/analyze-code", code, language],
    queryFn: () => apiRequest("POST", "/api/ai/analyze-code", { code, language }),
    enabled: code.length > 50
  });

  // Generate tests
  const testsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/generate-tests", {
        code,
        language,
        fileName
      });
      return response;
    }
  });

  // Auto-trigger suggestions on code change
  useEffect(() => {
    if (code.length > 10) {
      const timer = setTimeout(() => {
        suggestionsMutation.mutate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [code, cursorPosition]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const applySuggestion = (suggestion: Suggestion) => {
    if (suggestion.startLine !== undefined && suggestion.endLine !== undefined) {
      // Replace specific lines
      const lines = code.split('\n');
      const newLines = [
        ...lines.slice(0, suggestion.startLine),
        suggestion.code,
        ...lines.slice(suggestion.endLine + 1)
      ];
      onCodeChange(newLines.join('\n'));
    } else {
      // Insert at cursor or append
      onInsertCode(suggestion.code, cursorPosition);
    }
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      chatMutation.mutate(chatInput);
    }
  };

  const quickActions = [
    { 
      label: "Explain Code", 
      icon: <FileText className="h-4 w-4" />,
      action: () => setChatInput("Explain this code in detail")
    },
    { 
      label: "Add Comments", 
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => setChatInput("Add detailed comments to this code")
    },
    { 
      label: "Optimize", 
      icon: <Zap className="h-4 w-4" />,
      action: () => setChatInput("Optimize this code for better performance")
    },
    { 
      label: "Find Bugs", 
      icon: <Bug className="h-4 w-4" />,
      action: () => setChatInput("Find potential bugs or issues in this code")
    },
    { 
      label: "Refactor", 
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => setChatInput("Refactor this code to make it cleaner")
    },
    { 
      label: "Generate Tests", 
      icon: <TestTube className="h-4 w-4" />,
      action: () => testsMutation.mutate()
    }
  ];

  return (
    <div className="w-80 bg-dark-surface border-l border-dark-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-white">AI Copilot</span>
          </div>
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Gemini
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Suggest
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 py-2">
                {suggestionsMutation.isPending && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-400">Analyzing code...</span>
                  </div>
                )}

                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="bg-dark-bg border-dark-border">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${
                              suggestion.type === 'completion' ? 'bg-green-500' :
                              suggestion.type === 'refactor' ? 'bg-blue-500' :
                              suggestion.type === 'fix' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-xs font-medium text-white">
                              {suggestion.title}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-400 mb-3">
                          {suggestion.description}
                        </p>
                        
                        <div className="bg-black rounded p-2 mb-3">
                          <code className="text-xs text-green-400 font-mono">
                            {suggestion.code.length > 100 
                              ? suggestion.code.substring(0, 100) + '...'
                              : suggestion.code
                            }
                          </code>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-sm text-gray-400">No suggestions available</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => suggestionsMutation.mutate()}
                      disabled={suggestionsMutation.isPending}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col px-4">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3 py-2">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-dark-bg border border-dark-border text-gray-300'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about the code..."
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || chatMutation.isPending}
                  size="sm"
                >
                  {chatMutation.isPending ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 py-2">
                {analysis ? (
                  <>
                    <Card className="bg-dark-bg border-dark-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white">Code Quality</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Overall Score</span>
                          <Badge className={`${
                            analysis.quality?.score > 80 ? 'bg-green-600' :
                            analysis.quality?.score > 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {analysis.quality?.score || 0}/100
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {analysis.quality?.issues?.map((issue: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Bug className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-300">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-dark-bg border-dark-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-white">Complexity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400">Cyclomatic</span>
                            <span className="text-xs text-white">{analysis.complexity?.cyclomatic || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-400">Lines of Code</span>
                            <span className="text-xs text-white">{code.split('\n').length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-sm text-gray-400">Analysis will appear here</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => refetchAnalysis()}
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-2 py-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={action.action}
                  >
                    {action.icon}
                    <span className="ml-2 text-sm">{action.label}</span>
                  </Button>
                ))}

                {testsMutation.data && (
                  <Card className="bg-dark-bg border-dark-border mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Generated Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black rounded p-2 mb-3">
                        <code className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                          {testsMutation.data.tests}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onInsertCode(testsMutation.data.tests)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Insert Tests
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}