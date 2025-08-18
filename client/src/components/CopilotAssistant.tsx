import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Code, FileText, TestTube, RefreshCw, Lightbulb,
  Zap, MessageSquare, Settings, Check, X, Play,
  GitBranch, Bug, Sparkles, Brain, Target, Plus
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
    onSuccess: (data: any) => {
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
    onSuccess: (data: any) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: data.response || "I understand your request." }
      ]);
      setChatInput("");
    }
  });

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      chatMutation.mutate(chatInput);
    }
  };

  const handleInsertSuggestion = (suggestion: Suggestion) => {
    onInsertCode(suggestion.code, suggestion.startLine);
  };

  // Mock suggestions for demo
  useEffect(() => {
    if (code.length > 10) {
      setSuggestions([
        {
          id: '1',
          type: 'completion',
          title: 'Auto-complete function',
          description: 'Complete the current function implementation',
          code: '// Auto-generated completion',
          confidence: 95
        },
        {
          id: '2',
          type: 'optimize',
          title: 'Performance optimization',
          description: 'Optimize loop performance',
          code: '// Optimized code suggestion',
          confidence: 87
        }
      ]);
    }
  }, [code]);

  return (
    <div className="h-full bg-dark-surface border-l border-dark-border text-white flex flex-col">
      <div className="p-4 border-b border-dark-border bg-dark-bg">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">AI Assistant</h3>
          <Badge className="bg-blue-600 text-white text-xs">
            {language.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {fileName || "untitled"} • {code.length} characters
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-dark-bg border-b border-dark-border rounded-none w-full justify-start px-4">
          <TabsTrigger value="suggestions" className="text-xs">
            <Lightbulb className="h-3 w-3 mr-1" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 px-4">
          <ScrollArea className="h-full">
            <div className="space-y-3 py-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="bg-dark-bg border-dark-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${
                            suggestion.type === 'completion' ? 'bg-blue-600' :
                            suggestion.type === 'fix' ? 'bg-red-600' :
                            suggestion.type === 'optimize' ? 'bg-green-600' :
                            'bg-purple-600'
                          }`}>
                            {suggestion.type === 'completion' && <Code className="h-3 w-3" />}
                            {suggestion.type === 'fix' && <Bug className="h-3 w-3" />}
                            {suggestion.type === 'optimize' && <Zap className="h-3 w-3" />}
                            {suggestion.type === 'refactor' && <GitBranch className="h-3 w-3" />}
                          </div>
                          <Badge className="bg-gray-600 text-white text-xs">
                            {suggestion.confidence}%
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleInsertSuggestion(suggestion)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-gray-400 mb-2">
                        {suggestion.description}
                      </p>
                      <pre className="text-xs bg-gray-800 p-2 rounded border overflow-x-auto">
                        <code>{suggestion.code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">
                    {code.length > 10 ? 'Analyzing code...' : 'Start typing to get suggestions'}
                  </p>
                  <Button
                    onClick={() => suggestionsMutation.mutate()}
                    disabled={suggestionsMutation.isPending || code.length < 10}
                    size="sm"
                    className="mt-2"
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChatInput(e.target.value)}
                placeholder="Ask about the code..."
                className="flex-1 min-h-[60px] resize-none"
                onKeyPress={(e: React.KeyboardEvent) => {
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
              <Card className="bg-dark-bg border-dark-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Code Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Overall Score</span>
                    <Badge className="bg-green-600 text-white">
                      85/100
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Readability</span>
                      <span className="text-white">Good</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Performance</span>
                      <span className="text-white">Excellent</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Security</span>
                      <span className="text-white">Good</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-bg border-dark-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Complexity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Cyclomatic Complexity</span>
                    <Badge className="bg-yellow-600 text-white">
                      Medium
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-bg border-dark-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Test Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Coverage</span>
                    <Badge className="bg-orange-600 text-white">
                      45%
                    </Badge>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <TestTube className="h-3 w-3 mr-1" />
                    Generate Tests
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}