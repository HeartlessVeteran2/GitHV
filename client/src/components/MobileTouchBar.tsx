import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Play, Save, Copy, Undo, Redo, Search, 
  ZoomIn, ZoomOut, Menu, X, Plus, Folder,
  Settings, Palette, Code2, Terminal, FileText,
  ChevronUp, ChevronDown, MoreHorizontal, Clipboard
} from "lucide-react";

interface MobileTouchBarProps {
  onAction: (action: string, data?: any) => void;
  isCodeEditorFocused?: boolean;
  hasUndoRedo?: { canUndo: boolean; canRedo: boolean };
  zoomLevel?: number;
}

export default function MobileTouchBar({ 
  onAction, 
  isCodeEditorFocused = false,
  hasUndoRedo = { canUndo: false, canRedo: false },
  zoomLevel = 100
}: MobileTouchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  // Primary quick actions always visible
  const primaryActions = [
    { icon: <Play className="h-5 w-5" />, label: "Run", action: "run", color: "text-green-400" },
    { icon: <Save className="h-5 w-5" />, label: "Save", action: "save", color: "text-blue-400" },
    { icon: <Search className="h-5 w-5" />, label: "Find", action: "search", color: "text-yellow-400" },
  ];

  // Contextual actions based on editor state
  const editingActions = [
    { icon: <Undo className="h-4 w-4" />, label: "Undo", action: "undo", disabled: !hasUndoRedo.canUndo },
    { icon: <Redo className="h-4 w-4" />, label: "Redo", action: "redo", disabled: !hasUndoRedo.canRedo },
    { icon: <Copy className="h-4 w-4" />, label: "Copy", action: "copy" },
    { icon: <Clipboard className="h-4 w-4" />, label: "Paste", action: "paste" },
  ];

  const fileActions = [
    { icon: <Plus className="h-4 w-4" />, label: "New", action: "new-file" },
    { icon: <Folder className="h-4 w-4" />, label: "Open", action: "open-file" },
    { icon: <FileText className="h-4 w-4" />, label: "Recent", action: "recent-files" },
  ];

  const viewActions = [
    { icon: <ZoomIn className="h-4 w-4" />, label: "Zoom+", action: "zoom-in" },
    { icon: <ZoomOut className="h-4 w-4" />, label: "Zoom-", action: "zoom-out" },
    { icon: <Terminal className="h-4 w-4" />, label: "Terminal", action: "toggle-terminal" },
    { icon: <Code2 className="h-4 w-4" />, label: "AI", action: "toggle-ai" },
    { icon: <Settings className="h-4 w-4" />, label: "Web Viewer", action: "toggle-web-viewer" },
  ];

  const quickInserts = [
    { label: "function", code: "function ${1:name}(${2:params}) {\n  ${3:// code}\n}" },
    { label: "if/else", code: "if (${1:condition}) {\n  ${2:// code}\n} else {\n  ${3:// code}\n}" },
    { label: "for loop", code: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3:// code}\n}" },
    { label: "try/catch", code: "try {\n  ${1:// code}\n} catch (${2:error}) {\n  ${3:// handle error}\n}" },
    { label: "console.log", code: "console.log(${1:value});" },
    { label: "const", code: "const ${1:name} = ${2:value};" },
  ];

  return (
    <>
      {/* Fixed Touch Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-40 pb-safe">
        {/* Expandable Indicator */}
        <div className="flex justify-center py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-16 text-gray-400"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>

        {/* Primary Actions Row */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center space-x-3">
            {primaryActions.map((action) => (
              <Button
                key={action.action}
                variant="ghost"
                size="sm"
                onClick={() => onAction(action.action)}
                className={`flex flex-col items-center space-y-1 h-12 w-12 p-1 ${action.color}`}
                title={action.label}
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {zoomLevel}%
            </Badge>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-12 w-12 p-1">
                  <div className="flex flex-col items-center space-y-1">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="text-xs">More</span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetHeader>
                  <SheetTitle>Quick Actions</SheetTitle>
                </SheetHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="file">File</TabsTrigger>
                    <TabsTrigger value="view">View</TabsTrigger>
                    <TabsTrigger value="snippets">Code</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="edit" className="mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      {editingActions.map((action) => (
                        <Button
                          key={action.action}
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(action.action)}
                          disabled={action.disabled}
                          className="flex flex-col items-center space-y-2 h-16"
                        >
                          {action.icon}
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="file" className="mt-4">
                    <div className="grid grid-cols-3 gap-3">
                      {fileActions.map((action) => (
                        <Button
                          key={action.action}
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(action.action)}
                          className="flex flex-col items-center space-y-2 h-16"
                        >
                          {action.icon}
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="view" className="mt-4">
                    <div className="grid grid-cols-4 gap-3">
                      {viewActions.map((action) => (
                        <Button
                          key={action.action}
                          variant="outline"
                          size="sm"
                          onClick={() => onAction(action.action)}
                          className="flex flex-col items-center space-y-2 h-16"
                        >
                          {action.icon}
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="snippets" className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {quickInserts.map((snippet) => (
                        <Button
                          key={snippet.label}
                          variant="outline"
                          size="sm"
                          onClick={() => onAction('insert-snippet', snippet.code)}
                          className="flex items-center justify-start p-3 h-auto text-left"
                        >
                          <div>
                            <div className="text-sm font-medium">{snippet.label}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[120px]">
                              {snippet.code.split('\n')[0]}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Expanded Quick Actions */}
        {isExpanded && (
          <div className="px-4 pb-2 border-t border-gray-700 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {editingActions.slice(0, 4).map((action) => (
                  <Button
                    key={action.action}
                    variant="ghost"
                    size="sm"
                    onClick={() => onAction(action.action)}
                    disabled={action.disabled}
                    className="h-8 w-8 p-1"
                    title={action.label}
                  >
                    {action.icon}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                {viewActions.slice(0, 2).map((action) => (
                  <Button
                    key={action.action}
                    variant="ghost"
                    size="sm"
                    onClick={() => onAction(action.action)}
                    className="h-8 w-8 p-1"
                    title={action.label}
                  >
                    {action.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding to prevent content being hidden behind touch bar */}
      <div className="h-20 w-full" />
    </>
  );
}