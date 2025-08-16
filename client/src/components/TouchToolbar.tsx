import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Save, 
  Play, 
  Terminal, 
  Search, 
  GitBranch,
  FileText,
  Settings,
  Mic,
  Command,
  MoreVertical,
  Copy,
  Clipboard,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TouchToolbarProps {
  onSave: () => void;
  onRun: () => void;
  onOpenTerminal: () => void;
  onOpenSearch: () => void;
  onOpenGit: () => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
  onStartVoiceCommand: () => void;
  onOpenCommandPalette: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTogglePreview: () => void;
  isPreviewVisible?: boolean;
  position?: "left" | "right" | "bottom";
}

export default function TouchToolbar({ 
  onSave,
  onRun,
  onOpenTerminal,
  onOpenSearch,
  onOpenGit,
  onOpenFiles,
  onOpenSettings,
  onStartVoiceCommand,
  onOpenCommandPalette,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onTogglePreview,
  isPreviewVisible = false,
  position = "right"
}: TouchToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const primaryActions = [
    { icon: Save, label: "Save", action: onSave, color: "text-green-400" },
    { icon: Play, label: "Run", action: onRun, color: "text-blue-400" },
    { icon: Terminal, label: "Terminal", action: onOpenTerminal, color: "text-gray-400" },
    { icon: Search, label: "Search", action: onOpenSearch, color: "text-yellow-400" },
    { icon: GitBranch, label: "Git", action: onOpenGit, color: "text-purple-400" },
    { icon: Command, label: "Commands", action: onOpenCommandPalette, color: "text-indigo-400" }
  ];

  const secondaryActions = [
    { icon: FileText, label: "Files", action: onOpenFiles },
    { icon: Copy, label: "Copy", action: onCopy },
    { icon: Clipboard, label: "Paste", action: onPaste },
    { icon: Undo, label: "Undo", action: onUndo },
    { icon: Redo, label: "Redo", action: onRedo },
    { icon: ZoomIn, label: "Zoom In", action: onZoomIn },
    { icon: ZoomOut, label: "Zoom Out", action: onZoomOut },
    { icon: isPreviewVisible ? EyeOff : Eye, label: "Preview", action: onTogglePreview },
    { icon: Mic, label: "Voice", action: onStartVoiceCommand },
    { icon: Settings, label: "Settings", action: onOpenSettings }
  ];

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "fixed left-4 top-1/2 transform -translate-y-1/2 flex-col";
      case "bottom":
        return "fixed bottom-4 left-1/2 transform -translate-x-1/2 flex-row";
      case "right":
      default:
        return "fixed right-4 top-1/2 transform -translate-y-1/2 flex-col";
    }
  };

  const getCardClasses = () => {
    const isVertical = position === "left" || position === "right";
    return `bg-dark-surface/95 border-dark-border backdrop-blur-sm shadow-lg ${
      isVertical ? "flex-col" : "flex-row"
    }`;
  };

  return (
    <div className={`z-50 ${getPositionClasses()}`}>
      <Card className={`p-2 flex ${getCardClasses()}`}>
        {/* Primary Actions */}
        <div className={`flex ${position === "bottom" ? "flex-row" : "flex-col"} space-${position === "bottom" ? "x" : "y"}-2`}>
          {primaryActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-10 h-10 p-2 ${action.color || "text-gray-400"} hover:bg-dark-bg touch-manipulation`}
              onClick={action.action}
              title={action.label}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
          
          {/* More Actions Popover */}
          <Popover open={showMore} onOpenChange={setShowMore}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-2 text-gray-400 hover:bg-dark-bg touch-manipulation"
                title="More Actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-48 p-2 bg-dark-surface border-dark-border"
              side={position === "bottom" ? "top" : "left"}
            >
              <div className="grid grid-cols-2 gap-1">
                {secondaryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-12 p-2 flex-col text-xs touch-manipulation"
                    onClick={() => {
                      action.action();
                      setShowMore(false);
                    }}
                  >
                    <action.icon className="h-4 w-4 mb-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Card>
      
      {/* Haptic feedback indicator */}
      <div className="sr-only" id="haptic-feedback" />
    </div>
  );
}