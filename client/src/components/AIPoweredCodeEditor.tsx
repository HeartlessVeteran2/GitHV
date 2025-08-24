import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequestJson } from "@/lib/queryClient";
import { Editor } from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, Brain, FileText, TestTube, RefreshCw, 
  MessageCircle, Lightbulb, AlertTriangle, CheckCircle, 
  Info, Zap, Code, BookOpen
} from "lucide-react";

interface AIPoweredCodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onSave?: () => void;
}

interface CodeIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

interface CodeAnalysis {
  issues: CodeIssue[];
  quality_score: number;
  suggestions: string[];
}

interface AISuggestion {
  code: string;
  explanation: string;
  confidence: number;
}

interface DocumentationResponse {
  documentation: string;
}

interface ExplanationResponse {
  explanation: string;
}

interface TestsResponse {
  tests: string;
}

interface RefactorResponse {
  refactoredCode: string;
}

export default function AIPoweredCodeEditor({ 
  code, 
  language, 
  onChange,
  onSave 
}: AIPoweredCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [activeTab, setActiveTab] = useState("code");
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [documentation, setDocumentation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tests, setTests] = useState("");
  const [refactorInstructions, setRefactorInstructions] = useState("");

  // AI-powered code completion
  const codeCompletionMutation = useMutation({
    mutationFn: async (): Promise<{ suggestions: AISuggestion[] }> => {
      return apiRequestJson("POST", "/api/ai/code-completion", {
        code,
        language,
        cursorPosition
      });
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions || []);
    }
  });

  // Code analysis
  const analyzeCodeMutation = useMutation({
    mutationFn: async (): Promise<CodeAnalysis> => {
      return apiRequestJson("POST", "/api/ai/analyze-code", {
        code,
        language
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  // Generate documentation
  const generateDocsMutation = useMutation({
    mutationFn: async (): Promise<DocumentationResponse> => {
      return apiRequestJson("POST", "/api/ai/generate-docs", {
        code,
        language
      });
    },
    onSuccess: (data) => {
      setDocumentation(data.documentation);
    }
  });

  // Explain code
  const explainCodeMutation = useMutation({
    mutationFn: async (): Promise<ExplanationResponse> => {
      return apiRequestJson("POST", "/api/ai/explain-code", {
        code,
        language
      });
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    }
  });

  // Generate tests
  const generateTestsMutation = useMutation({
    mutationFn: async (): Promise<TestsResponse> => {
      return apiRequestJson("POST", "/api/ai/generate-tests", {
        code,
        language
      });
    },
    onSuccess: (data) => {
      setTests(data.tests);
    }
  });

  // Refactor code
  const refactorCodeMutation = useMutation({
    mutationFn: async (): Promise<RefactorResponse> => {
      return apiRequestJson("POST", "/api/ai/refactor-code", {
        code,
        language,
        instructions: refactorInstructions
      });
    },
    onSuccess: (data) => {
      onChange(data.refactoredCode);
    }
  });

  // Auto-analyze on code changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.trim().length > 50) {
        analyzeCodeMutation.mutate();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code]);

  const insertSuggestion = (suggestion: any) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits("ai-suggestion", [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: suggestion.code
      }]);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
            lineNumbers: "on",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            acceptSuggestionOnCommitCharacter: true,
            snippetSuggestions: "top"
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            
            // Track cursor position
            editor.onDidChangeCursorPosition((e) => {
              setCursorPosition({
                line: e.position.lineNumber,
                column: e.position.column
              });
            });

            // AI completion shortcut  
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
              codeCompletionMutation.mutate();
            });
          }}
        />
      </div>

      {/* AI Assistant Panel */}
      <div className="w-96 border-l border-dark-border bg-dark-surface">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4 bg-dark-bg">
            <TabsTrigger value="code" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Tools
            </TabsTrigger>
          </TabsList>

          {/* AI Suggestions */}
          <TabsContent value="code" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">AI Suggestions</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => codeCompletionMutation.mutate()}
                  disabled={codeCompletionMutation.isPending}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {codeCompletionMutation.isPending ? "Thinking..." : "Get Ideas"}
                </Button>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Card key={index} className="bg-dark-bg border-dark-border">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}% confident
                          </Badge>
                          <Button 
                            size="sm"
                            onClick={() => insertSuggestion(suggestion)}
                            className="h-6 text-xs"
                          >
                            Insert
                          </Button>
                        </div>
                        <pre className="text-xs bg-dark-surface rounded p-2 mb-2 overflow-x-auto">
                          <code>{suggestion.code}</code>
                        </pre>
                        <p className="text-xs text-gray-300">{suggestion.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {aiSuggestions.length === 0 && !codeCompletionMutation.isPending && (
                <div className="text-center py-8 text-gray-400">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Get Ideas" for AI suggestions</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Code Analysis */}
          <TabsContent value="analysis" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Code Analysis</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => analyzeCodeMutation.mutate()}
                  disabled={analyzeCodeMutation.isPending}
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Analyze
                </Button>
              </div>

              {analysis && (
                <div className="space-y-3">
                  {/* Quality Score */}
                  <Card className="bg-dark-bg border-dark-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Code Quality</span>
                        <span className={`text-lg font-bold ${getQualityColor(analysis.quality_score)}`}>
                          {Math.round(analysis.quality_score * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues */}
                  {analysis.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Issues Found</h4>
                      {analysis.issues.map((issue, index) => (
                        <Card key={index} className="bg-dark-bg border-dark-border">
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-2">
                              {getSeverityIcon(issue.severity)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs text-gray-400">Line {issue.line}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-white mb-1">{issue.message}</p>
                                <p className="text-xs text-gray-300">{issue.suggestion}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Suggestions</h4>
                      {analysis.suggestions.map((suggestion, index) => (
                        <Card key={index} className="bg-dark-bg border-dark-border">
                          <CardContent className="p-3">
                            <p className="text-sm text-gray-300">{suggestion}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documentation & Explanation */}
          <TabsContent value="docs" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Documentation</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateDocsMutation.mutate()}
                    disabled={generateDocsMutation.isPending}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                </div>

                {documentation && (
                  <Card className="bg-dark-bg border-dark-border">
                    <CardContent className="p-3">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {documentation}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Code Explanation</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => explainCodeMutation.mutate()}
                    disabled={explainCodeMutation.isPending}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Explain
                  </Button>
                </div>

                {explanation && (
                  <Card className="bg-dark-bg border-dark-border">
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Tools */}
          <TabsContent value="tools" className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Test Generation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Generate Tests</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateTestsMutation.mutate()}
                    disabled={generateTestsMutation.isPending}
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                </div>

                {tests && (
                  <Card className="bg-dark-bg border-dark-border">
                    <CardContent className="p-3">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                        <code>{tests}</code>
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Code Refactoring */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Refactor Code</h3>
                <Textarea
                  placeholder="Describe how you want to refactor the code..."
                  value={refactorInstructions}
                  onChange={(e) => setRefactorInstructions(e.target.value)}
                  className="bg-dark-bg border-dark-border text-white text-sm"
                  rows={3}
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => refactorCodeMutation.mutate()}
                  disabled={refactorCodeMutation.isPending || !refactorInstructions.trim()}
                  className="w-full"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {refactorCodeMutation.isPending ? "Refactoring..." : "Refactor"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}