import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileCode, File } from "lucide-react";
import type { File as FileType } from "@shared/schema";

interface EditorTab {
  id: string;
  file: FileType;
  isDirty: boolean;
  content: string;
}

interface CodeEditorProps {
  openFiles: FileType[];
  activeFileId: string | null;
  onFileClose: (fileId: string) => void;
  onFileChange: (fileId: string, content: string) => void;
  onActiveFileChange: (fileId: string) => void;
}

export default function CodeEditor({ 
  openFiles, 
  activeFileId, 
  onFileClose, 
  onFileChange,
  onActiveFileChange 
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);

  useEffect(() => {
    setTabs(openFiles.map(file => ({
      id: file.id,
      file,
      isDirty: false,
      content: file.content || ""
    })));
  }, [openFiles]);

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
      default:
        return 'plaintext';
    }
  };

  const handleEditorChange = (value: string | undefined, fileId: string) => {
    if (value !== undefined) {
      onFileChange(fileId, value);
      
      // Mark tab as dirty
      setTabs(prev => prev.map(tab => 
        tab.id === fileId ? { ...tab, isDirty: true, content: value } : tab
      ));
    }
  };

  const activeFile = tabs.find(tab => tab.id === activeFileId);

  return (
    <main className="flex-1 flex flex-col min-w-0">
      {/* Editor Tabs */}
      <div className="bg-dark-surface border-b border-dark-border">
        <Tabs value={activeFileId || ""} onValueChange={onActiveFileChange}>
          <div className="flex overflow-x-auto scrollbar-thin">
            <TabsList className="bg-transparent p-0 h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-4 py-3 text-sm border-r border-dark-border bg-transparent hover:bg-dark-surface data-[state=active]:bg-dark-bg flex items-center space-x-2 flex-shrink-0 rounded-none"
                >
                  {getFileIcon(tab.file.path)}
                  <span className="truncate max-w-32">
                    {tab.file.path.split('/').pop()}
                  </span>
                  {tab.isDirty && (
                    <span className="w-1 h-1 bg-orange-400 rounded-full" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-0 h-4 w-4 hover:bg-dark-border rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileClose(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* Editor Content */}
          <div className="flex-1 relative" style={{ height: "calc(100vh - 260px)" }}>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                <div className="flex h-full">
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={getLanguage(tab.file.path)}
                      value={tab.content}
                      onChange={(value) => handleEditorChange(value, tab.id)}
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
                        snippetSuggestions: "top",
                        folding: true,
                        foldingHighlight: true,
                        showFoldingControls: "always",
                        matchBrackets: "always",
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        autoSurround: "languageDefined",
                      }}
                      onMount={(editor) => {
                        editorRef.current = editor;
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
            
            {tabs.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files open</p>
                  <p className="text-sm">Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </main>
  );
}
