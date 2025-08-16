import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  X, FileCode, File, Menu, Play, Save, Search, GitBranch, 
  Terminal, Settings, Mic, Code, Layers, Zap 
} from "lucide-react";
import type { File as FileType } from "@shared/schema";

interface MobileCodeEditorProps {
  openFiles: FileType[];
  activeFileId: string | null;
  onFileClose: (fileId: string) => void;
  onFileChange: (fileId: string, content: string) => void;
  onActiveFileChange: (fileId: string) => void;
  onSave: () => void;
  onRun: () => void;
}

export default function MobileCodeEditor({ 
  openFiles, 
  activeFileId, 
  onFileClose, 
  onFileChange,
  onActiveFileChange,
  onSave,
  onRun
}: MobileCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  const activeFile = openFiles.find(file => file.id === activeFileId);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode className="h-3 w-3 text-yellow-400" />;
      case 'json':
        return <File className="h-3 w-3 text-green-400" />;
      case 'css':
        return <File className="h-3 w-3 text-blue-400" />;
      case 'html':
        return <File className="h-3 w-3 text-orange-400" />;
      case 'md':
        return <File className="h-3 w-3 text-purple-400" />;
      default:
        return <File className="h-3 w-3 text-gray-400" />;
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFileId) {
      onFileChange(activeFileId, value);
    }
  };

  const insertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits("snippet-insert", [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: snippet
      }]);
    }
  };

  // Quick snippets for mobile
  const quickSnippets = [
    { label: "Function", code: "function name() {\n  \n}" },
    { label: "Arrow Fn", code: "const name = () => {\n  \n}" },
    { label: "If", code: "if (condition) {\n  \n}" },
    { label: "For", code: "for (let i = 0; i < length; i++) {\n  \n}" },
    { label: "Try", code: "try {\n  \n} catch (error) {\n  \n}" },
    { label: "Class", code: "class Name {\n  constructor() {\n    \n  }\n}" }
  ];

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 bg-dark-surface border-b border-dark-border">
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-dark-surface border-dark-border">
            <div className="flex flex-col space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-white">Mobile IDE</h3>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={onRun} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
                <Button variant="outline" className="border-dark-border">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" className="border-dark-border">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Git
                </Button>
                <Button variant="outline" className="border-dark-border">
                  <Terminal className="h-4 w-4 mr-2" />
                  Terminal
                </Button>
                <Button variant="outline" className="border-dark-border">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </Button>
              </div>

              {/* Editor Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Editor Settings</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Font Size</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <span className="text-sm text-white w-8 text-center">{fontSize}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Line Numbers</span>
                  <Button
                    size="sm"
                    variant={showLineNumbers ? "default" : "outline"}
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                  >
                    {showLineNumbers ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Word Wrap</span>
                  <Button
                    size="sm"
                    variant={wordWrap ? "default" : "outline"}
                    onClick={() => setWordWrap(!wordWrap)}
                  >
                    {wordWrap ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              {/* Quick Snippets */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Quick Snippets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickSnippets.map((snippet, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        insertSnippet(snippet.code);
                        setShowMenu(false);
                      }}
                      className="text-xs"
                    >
                      {snippet.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* File Tabs - Horizontal Scroll */}
        <div className="flex-1 mx-3">
          {openFiles.length > 0 && (
            <div className="flex overflow-x-auto space-x-1 scrollbar-thin">
              {openFiles.map((file) => (
                <Button
                  key={file.id}
                  variant={file.id === activeFileId ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onActiveFileChange(file.id)}
                  className="flex items-center space-x-1 flex-shrink-0 text-xs"
                >
                  {getFileIcon(file.path)}
                  <span className="max-w-16 truncate">
                    {file.path.split('/').pop()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-3 w-3 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileClose(file.id);
                    }}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="ghost" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRun}>
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeFile ? (
          <Editor
            height="100%"
            language={getLanguage(activeFile.path)}
            value={activeFile.content || ""}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize,
              fontFamily: "Monaco, Consolas, monospace",
              lineNumbers: showLineNumbers ? "on" : "off",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: wordWrap ? "on" : "off",
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              folding: true,
              matchBrackets: "always",
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              // Mobile optimizations
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
              },
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              mouseWheelZoom: true
            }}
            onMount={(editor) => {
              editorRef.current = editor;
              
              // Add mobile-friendly key bindings using monaco-editor constants
              const monaco = (window as any).monaco;
              if (monaco) {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                  onSave();
                });
                
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
                  onRun();
                });
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <FileCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No files open</p>
              <p className="text-sm mt-2">Select a file to start coding</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="flex items-center justify-between p-2 bg-dark-surface border-t border-dark-border">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Button size="sm" variant="ghost" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Format
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <Layers className="h-3 w-3 mr-1" />
            Outline
          </Button>
          <Button size="sm" variant="ghost" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            AI
          </Button>
        </div>
        
        {activeFile && (
          <div className="text-xs text-gray-400">
            {getLanguage(activeFile.path)}
          </div>
        )}
      </div>
    </div>
  );
}