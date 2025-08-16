import { useRef, useEffect } from 'react';

interface MonacoEditorProps {
  value: string;
  language: string;
  theme?: 'vs-dark' | 'vs-light';
  onChange?: (value: string) => void;
  onCursorPositionChange?: (position: number) => void;
  onSelectionChange?: (selectedText: string) => void;
  height?: string;
  width?: string;
}

export default function MonacoEditor({
  value,
  language,
  theme = 'vs-dark',
  onChange,
  onCursorPositionChange,
  onSelectionChange,
  height = '100%',
  width = '100%'
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a simple textarea with syntax highlighting styles for now
  // Monaco editor requires complex webpack configuration
  return (
    <div 
      ref={containerRef} 
      style={{ height, width }}
      className={`relative font-mono text-sm ${theme === 'vs-dark' ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-900'}`}
    >
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          onCursorPositionChange?.(target.selectionStart);
          const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
          onSelectionChange?.(selectedText);
        }}
        className={`w-full h-full p-4 resize-none outline-none border-none ${
          theme === 'vs-dark' 
            ? 'bg-gray-900 text-green-400 placeholder-gray-500' 
            : 'bg-white text-gray-900 placeholder-gray-400'
        }`}
        placeholder="Start coding..."
        style={{
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          tabSize: 2
        }}
        onKeyDown={(e) => {
          // Handle keyboard shortcuts
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const event = new CustomEvent('monaco-save');
            window.dispatchEvent(event);
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const event = new CustomEvent('monaco-run');
            window.dispatchEvent(event);
          }
          // Handle tab indentation
          if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const newValue = value.substring(0, start) + '  ' + value.substring(end);
            onChange?.(newValue);
            // Set cursor position after the tab
            setTimeout(() => {
              target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
          }
        }}
      />
      
      {/* Line numbers overlay */}
      <div className={`absolute top-0 left-0 pointer-events-none select-none ${
        theme === 'vs-dark' ? 'text-gray-600' : 'text-gray-400'
      }`} style={{ 
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        padding: '16px 0 16px 8px'
      }}>
        {value.split('\n').map((_, index) => (
          <div key={index} style={{ height: '21px' }}>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}