import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { debounce, throttle, performanceTracker } from '@/lib/performance';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Save, Copy, Download, Upload, Maximize2, 
  Minimize2, RotateCcw, RotateCw, Search, FileText,
  X, Plus, Settings, Zap, CheckCircle
} from 'lucide-react';

interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  modified: boolean;
  active: boolean;
}

interface OptimizedCodeEditorProps {
  openFiles: FileTab[];
  activeFileId: string | null;
  onFileClose: (fileId: string) => void;
  onFileChange: (fileId: string, content: string) => void;
  onActiveFileChange: (fileId: string) => void;
  onSave: () => void;
  onRun: () => void;
}

export default function OptimizedCodeEditor({
  openFiles,
  activeFileId,
  onFileClose,
  onFileChange,
  onActiveFileChange,
  onSave,
  onRun
}: OptimizedCodeEditorProps) {
  const { isPhone, isTablet, deviceInfo } = useDeviceDetection();
  const editorRef = useRef<any>(null);
  const [editorOptions, setEditorOptions] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Performance optimized content change handler
  const debouncedContentChange = useMemo(
    () => debounce((fileId: string, content: string) => {
      onFileChange(fileId, content);
    }, 300),
    [onFileChange]
  );

  // Throttled scroll handler for performance
  const throttledScrollHandler = useMemo(
    () => throttle(() => {
      // Handle scroll-based optimizations
    }, 100),
    []
  );

  // Optimized editor options based on device
  const getOptimizedEditorOptions = useCallback(() => {
    const baseOptions = {
      automaticLayout: true,
      wordWrap: 'on' as const,
      lineNumbers: 'on' as const,
      minimap: { enabled: !isPhone },
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'always' as const,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      renderWhitespace: 'boundary' as const,
      renderLineHighlight: 'all' as const,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      trimAutoWhitespace: true,
      formatOnPaste: true,
      formatOnType: true,
      fontFamily: '"Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace',
      fontLigatures: true,
      cursorBlinking: 'smooth' as const,
      cursorSmoothCaretAnimation: "on" as const
    };

    if (isPhone) {
      return {
        ...baseOptions,
        fontSize: Math.max(16, deviceInfo.screenWidth * 0.04),
        lineHeight: 1.6,
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12
        },
        minimap: { enabled: false },
        folding: false,
        lineNumbers: 'off' as const,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        renderLineHighlight: 'none' as const
      };
    }

    if (isTablet) {
      return {
        ...baseOptions,
        fontSize: 14,
        lineHeight: 1.5,
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 14,
          horizontalScrollbarSize: 14
        }
      };
    }

    return {
      ...baseOptions,
      fontSize: 14,
      lineHeight: 1.4,
      scrollbar: {
        useShadows: true,
        verticalScrollbarSize: 16,
        horizontalScrollbarSize: 16
      }
    };
  }, [isPhone, isTablet, deviceInfo.screenWidth]);

  // Update editor options when device changes
  useEffect(() => {
    const options = getOptimizedEditorOptions();
    setEditorOptions(options);
  }, [getOptimizedEditorOptions]);

  // Active file content
  const activeFile = useMemo(
    () => openFiles.find(file => file.id === activeFileId),
    [openFiles, activeFileId]
  );

  // Handle editor content change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeFileId) {
      performanceTracker.start('editor-change');
      debouncedContentChange(activeFileId, value);
      performanceTracker.end('editor-change');
    }
  }, [activeFileId, debouncedContentChange]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add performance monitoring
    editor.onDidChangeModelContent(() => {
      performanceTracker.start('content-change');
    });

    // Add keyboard shortcuts
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => onSave()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
      () => onRun()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      () => setSearchVisible(true)
    );
  }, [onSave, onRun]);

  // Optimized tab rendering
  const renderTabs = useMemo(() => {
    if (openFiles.length === 0) return null;

    return (
      <div className="flex items-center bg-dark-surface border-b border-dark-border overflow-x-auto">
        <div className="flex items-center min-w-0 flex-1">
          {openFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center px-3 py-2 border-r border-dark-border cursor-pointer min-w-0 group ${
                file.id === activeFileId
                  ? 'bg-dark-bg text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-bg/50'
              }`}
              onClick={() => onActiveFileChange(file.id)}
            >
              <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="text-sm truncate max-w-[120px]">{file.name}</span>
              {file.modified && (
                <div className="w-1 h-1 bg-blue-400 rounded-full ml-2 flex-shrink-0" />
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center px-2 space-x-1 border-l border-dark-border bg-dark-surface">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }, [openFiles, activeFileId, onActiveFileChange, onFileClose]);

  // Optimized toolbar
  const renderToolbar = useMemo(() => (
    <div className="flex items-center justify-between px-4 py-2 bg-dark-surface border-b border-dark-border">
      <div className="flex items-center space-x-2">
        <Button size="sm" onClick={onSave} className="bg-green-600 hover:bg-green-700">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button size="sm" onClick={onRun} className="bg-blue-600 hover:bg-blue-700">
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search className="h-3 w-3 mr-1" />
          Search
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {activeFile && (
          <Badge variant="secondary" className="text-xs">
            {activeFile.language.toUpperCase()}
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3 w-3" />
          ) : (
            <Maximize2 className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  ), [onSave, onRun, searchVisible, activeFile, isFullscreen]);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-bg text-gray-400">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No file open</p>
          <p className="text-sm">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-dark-bg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {renderToolbar}
      {renderTabs}
      
      <div className="flex-1 relative">
        <Editor
          language={activeFile.language}
          value={activeFile.content}
          options={editorOptions}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          loading={
            <div className="h-full flex items-center justify-center bg-dark-bg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />

        {/* Performance indicator */}
        {isPhone && (
          <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
            <Zap className="h-3 w-3 inline mr-1" />
            Optimized
          </div>
        )}
      </div>
    </div>
  );
}