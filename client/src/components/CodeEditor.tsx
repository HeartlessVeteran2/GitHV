import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, FileCode, File, Split, Maximize2 } from "lucide-react";
import type { File as FileType } from "@shared/schema";
import CodeCompletion from "./CodeCompletion";
import TouchToolbar from "./TouchToolbar";
import CommandPalette from "./CommandPalette";
// import SmartSearchBar from "./SmartSearchBar";
import VoiceCommand from "./VoiceCommand";
import CodeSnippets from "./CodeSnippets";
import PerformanceMonitor from "./PerformanceMonitor";
import FileDiff from "./FileDiff";
import GitVisualization from "./GitVisualization";
import ProjectTemplates from "./ProjectTemplates";

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
  repositories?: any[];
  onSave?: () => void;
  onRun?: () => void;
}

export default function CodeEditor({ 
  openFiles, 
  activeFileId, 
  onFileClose, 
  onFileChange,
  onActiveFileChange,
  repositories = [],
  onSave = () => {},
  onRun = () => {}
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [splitView, setSplitView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCodeCompletion, setShowCodeCompletion] = useState(false);
  const [completionPosition, setCompletionPosition] = useState({ x: 0, y: 0 });
  const [currentLine, setCurrentLine] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showFileDiff, setShowFileDiff] = useState(false);
  const [showGitVisualization, setShowGitVisualization] = useState(false);
  const [showProjectTemplates, setShowProjectTemplates] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  useEffect(() => {
    setTabs(openFiles.map(file => ({
      id: file.id,
      file,
      isDirty: false,
      content: file.content || ""
    })));
  }, [openFiles]);

  // Handler functions for new features
  const handleVoiceCommand = (command: string, confidence: number) => {
    console.log(`Voice command: ${command} (${confidence}% confidence)`);
    
    switch (command) {
      case "save":
        onSave();
        break;
      case "run":
        onRun();
        break;
      case "open-files":
        // Trigger file explorer
        break;
      case "terminal":
        // Open terminal
        break;
      case "search":
        console.log('Search triggered via voice');
        break;
      case "git-status":
        setShowGitVisualization(true);
        break;
      case "new-file":
        // Create new file
        break;
      case "zoom-in":
        handleZoomIn();
        break;
      case "zoom-out":
        handleZoomOut();
        break;
      case "settings":
        // Open settings
        break;
    }
  };

  const handleZoomIn = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const currentFontSize = editor.getOption(45) || 14; // 45 is fontSize
      editor.updateOptions({ fontSize: Math.min(currentFontSize + 2, 24) });
    }
  };

  const handleZoomOut = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const currentFontSize = editor.getOption(45) || 14;
      editor.updateOptions({ fontSize: Math.max(currentFontSize - 2, 10) });
    }
  };

  const handleInsertSnippet = (code: string) => {
    if (editorRef.current && activeFileId) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.executeEdits("snippet-insert", [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: code
      }]);
      editor.setPosition({
        lineNumber: position.lineNumber + code.split('\n').length - 1,
        column: code.split('\n').pop()?.length + 1 || position.column
      });
    }
  };

  const handleCreateProject = (template: any, projectName: string) => {
    console.log(`Creating project "${projectName}" from template "${template.name}"`);
    // Implementation would create new project with template files
  };

  const handleEditorKeyDown = (e: any) => {
    // Trigger code completion on Ctrl+Space
    if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
      const editor = editorRef.current;
      if (editor) {
        const position = editor.getPosition();
        const model = editor.getModel();
        const line = model.getLineContent(position.lineNumber);
        
        setCurrentLine(line);
        setCompletionPosition({
          x: position.column * 8, // Approximate character width
          y: position.lineNumber * 20 // Approximate line height
        });
        setShowCodeCompletion(true);
      }
    }

    // Command palette shortcut
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyP") {
      e.preventDefault();
      setShowCommandPalette(true);
    }


  };

  // Keyboard shortcut effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }

      // Run shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        onRun();
      }

      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }


    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onRun]);

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

            {/* Advanced Editor Controls */}
            <div className="ml-auto flex items-center space-x-2 px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSplitView(!splitView)}
                title="Toggle Split View"
              >
                <Split className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Toggle Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
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
                        
                        // Add keyboard handler for advanced features
                        editor.onKeyDown(handleEditorKeyDown);
                      }}
                    />
                  </div>

                  {/* Split View - Second Editor */}
                  {splitView && (
                    <div className="flex-1 border-l border-dark-border">
                      <Editor
                        height="100%"
                        language={getLanguage(tab.file.path)}
                        value={tab.content}
                        theme="vs-dark"
                        options={{
                          fontSize: 14,
                          fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
                          readOnly: true,
                          minimap: { enabled: false },
                        }}
                      />
                    </div>
                  )}
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

      {/* Touch Toolbar */}
      <TouchToolbar
        onSave={onSave}
        onRun={onRun}
        onOpenTerminal={() => {/* Open terminal */}}
        onOpenSearch={() => console.log('Search opened')}
        onOpenGit={() => setShowGitVisualization(true)}
        onOpenFiles={() => {/* Open files */}}
        onOpenSettings={() => {/* Open settings */}}
        onStartVoiceCommand={() => setIsListeningVoice(!isListeningVoice)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onCopy={() => document.execCommand('copy')}
        onPaste={() => document.execCommand('paste')}
        onUndo={() => editorRef.current?.trigger('keyboard', 'undo')}
        onRedo={() => editorRef.current?.trigger('keyboard', 'redo')}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onTogglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
        isPreviewVisible={isPreviewVisible}
      />

      {/* Advanced Feature Overlays */}
      {showCodeCompletion && activeFile && (
        <CodeCompletion
          isVisible={showCodeCompletion}
          position={completionPosition}
          onSelect={(suggestion) => {
            handleInsertSnippet(suggestion.text);
            setShowCodeCompletion(false);
          }}
          onClose={() => setShowCodeCompletion(false)}
          currentLine={currentLine}
          language={getLanguage(activeFile.file.path)}
        />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onFileOpen={(path) => console.log('Open file:', path)}
        onGitAction={(action) => console.log('Git action:', action)}
        onTerminalOpen={() => console.log('Open terminal')}
        onSettingsOpen={() => console.log('Open settings')}
        onSave={onSave}
        onRun={onRun}
        onSearch={() => console.log('Search opened')}
        onVoiceCommand={() => setIsListeningVoice(true)}
        onPreviewToggle={() => setIsPreviewVisible(!isPreviewVisible)}
      />



      {showVoiceCommands && (
        <div className="fixed bottom-20 right-4 z-50 w-80">
          <VoiceCommand
            isListening={isListeningVoice}
            onToggleListening={() => setIsListeningVoice(!isListeningVoice)}
            onCommand={handleVoiceCommand}
          />
        </div>
      )}

      {showCodeSnippets && (
        <div className="fixed top-16 right-4 z-50 w-96">
          <CodeSnippets onInsertSnippet={handleInsertSnippet} />
        </div>
      )}

      {showPerformance && (
        <div className="fixed top-16 left-4 z-50 w-96">
          <PerformanceMonitor />
        </div>
      )}

      {showFileDiff && activeFile && (
        <div className="fixed inset-4 z-50">
          <FileDiff
            filePath={activeFile.file.path}
            oldContent={activeFile.file.content || ''}
            newContent={activeFile.content}
            onRevert={(path) => console.log('Revert file:', path)}
            onAcceptChanges={(path) => console.log('Accept changes:', path)}
          />
        </div>
      )}

      {showGitVisualization && (
        <div className="fixed top-16 right-4 z-50 w-96">
          <GitVisualization
            repository={repositories[0]}
            onBranchSwitch={(branch) => console.log('Switch to branch:', branch)}
            onCommitSelect={(commit) => console.log('Selected commit:', commit)}
          />
        </div>
      )}

      {showProjectTemplates && (
        <div className="fixed inset-4 z-50">
          <ProjectTemplates onCreateProject={handleCreateProject} />
        </div>
      )}
    </main>
  );
}
