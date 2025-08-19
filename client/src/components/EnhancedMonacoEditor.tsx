import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Save, Play, Bug, Zap, FileText, Copy, Scissors, 
  Undo, Redo, Search, Replace, Code2, Sparkles 
} from 'lucide-react';

interface EnhancedMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  fileName?: string;
  onSave?: () => void;
  onRun?: () => void;
  onFormat?: () => void;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'vs-light';
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  height?: string;
}

export default function EnhancedMonacoEditor({
  value,
  onChange,
  language,
  fileName,
  onSave,
  onRun,
  onFormat,
  readOnly = false,
  theme = 'vs-dark',
  minimap = true,
  lineNumbers = true,
  wordWrap = false,
  fontSize = 14,
  height = '500px'
}: EnhancedMonacoEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<any>(null);
  const [editorStats, setEditorStats] = useState({
    lines: 0,
    characters: 0,
    selection: 0
  });
  const [undoRedoState, setUndoRedoState] = useState({
    canUndo: false,
    canRedo: false
  });

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor settings
    editor.updateOptions({
      fontSize,
      minimap: { enabled: minimap },
      lineNumbers: lineNumbers ? 'on' : 'off',
      wordWrap: wordWrap ? 'on' : 'off',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderWhitespace: 'selection',
      showFoldingControls: 'always',
      folding: true,
      foldingHighlight: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      onFormat?.();
    });

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      updateEditorStats(editor);
      updateUndoRedoState(editor);
    });

    // Listen for selection changes
    editor.onDidChangeCursorSelection(() => {
      updateEditorStats(editor);
    });

    // Initial stats update
    updateEditorStats(editor);
  };

  const updateEditorStats = (editor: any) => {
    const model = editor.getModel();
    if (model) {
      const selection = editor.getSelection();
      const selectedText = selection ? model.getValueInRange(selection) : '';
      
      setEditorStats({
        lines: model.getLineCount(),
        characters: model.getValueLength(),
        selection: selectedText.length
      });
    }
  };

  const updateUndoRedoState = (editor: any) => {
    const model = editor.getModel();
    if (model) {
      setUndoRedoState({
        canUndo: model.canUndo(),
        canRedo: model.canRedo()
      });
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
      toast({ title: "Copied", description: "Text copied to clipboard" });
    }
  };

  const handleCut = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.clipboardCutAction', null);
      toast({ title: "Cut", description: "Text cut to clipboard" });
    }
  };

  const handleFind = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'actions.find', null);
    }
  };

  const handleReplace = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
    }
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', null);
      toast({ title: "Formatted", description: "Code formatted successfully" });
      onFormat?.();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {fileName || 'Untitled'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!undoRedoState.canUndo}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!undoRedoState.canRedo}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-gray-600 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy (Ctrl+C)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleCut}>
                  <Scissors className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cut (Ctrl+X)</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-gray-600 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleFind}>
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Find (Ctrl+F)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleReplace}>
                  <Replace className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Replace (Ctrl+H)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleFormat}>
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Format (Ctrl+Shift+F)</TooltipContent>
            </Tooltip>

            {onSave && (
              <>
                <div className="w-px h-4 bg-gray-600 mx-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save (Ctrl+S)</TooltipContent>
                </Tooltip>
              </>
            )}

            {onRun && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onRun}>
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run (Ctrl+Enter)</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height={height}
          language={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            readOnly,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            mouseWheelZoom: true,
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            parameterHints: { enabled: true },
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: 'full',
            detectIndentation: true,
            insertSpaces: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Lines: {editorStats.lines}</span>
          <span>Characters: {editorStats.characters}</span>
          {editorStats.selection > 0 && (
            <span>Selected: {editorStats.selection}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="capitalize">{language}</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
}