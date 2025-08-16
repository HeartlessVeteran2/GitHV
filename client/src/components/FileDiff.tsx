import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitCommit, 
  Plus, 
  Minus, 
  RotateCcw, 
  Eye,
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface DiffLine {
  type: "add" | "remove" | "context" | "header";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  isExpanded?: boolean;
}

interface FileDiffProps {
  filePath: string;
  oldContent: string;
  newContent: string;
  onRevert?: (filePath: string) => void;
  onAcceptChanges?: (filePath: string) => void;
}

export default function FileDiff({ 
  filePath, 
  oldContent, 
  newContent, 
  onRevert, 
  onAcceptChanges 
}: FileDiffProps) {
  const [viewMode, setViewMode] = useState<"split" | "unified">("unified");
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  const generateDiff = (): DiffLine[] => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: DiffLine[] = [];
    
    // Simple diff algorithm - in production, use a proper diff library
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];
      
      if (oldIndex >= oldLines.length) {
        // Only new lines remaining
        diff.push({
          type: "add",
          content: newLine,
          newLineNumber: newIndex + 1
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only old lines remaining
        diff.push({
          type: "remove",
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        oldIndex++;
      } else if (oldLine === newLine) {
        // Lines match
        diff.push({
          type: "context",
          content: oldLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      } else {
        // Lines differ - simplified: assume line was changed
        diff.push({
          type: "remove",
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        diff.push({
          type: "add",
          content: newLine,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      }
    }
    
    return diff;
  };

  const diffLines = generateDiff();
  const stats = {
    additions: diffLines.filter(line => line.type === "add").length,
    deletions: diffLines.filter(line => line.type === "remove").length
  };

  const getDiffLineClasses = (line: DiffLine): string => {
    const baseClasses = "font-mono text-sm px-4 py-1 border-l-2";
    
    switch (line.type) {
      case "add":
        return `${baseClasses} bg-green-900/20 border-green-400 text-green-100`;
      case "remove":
        return `${baseClasses} bg-red-900/20 border-red-400 text-red-100`;
      case "context":
        return `${baseClasses} bg-transparent border-gray-600 text-gray-300`;
      case "header":
        return `${baseClasses} bg-blue-900/20 border-blue-400 text-blue-100 font-medium`;
      default:
        return baseClasses;
    }
  };

  const toggleSection = (index: number) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedSections(newCollapsed);
  };

  const renderLineNumbers = (line: DiffLine, index: number) => {
    return (
      <div className="flex text-xs text-gray-500 w-20 justify-between px-2 select-none">
        <span>{line.oldLineNumber || ""}</span>
        <span>{line.newLineNumber || ""}</span>
      </div>
    );
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const showWhitespaceChars = (content: string) => {
      if (!showWhitespace) return content;
      return content.replace(/ /g, '·').replace(/\t/g, '→');
    };

    return (
      <div key={index} className="flex">
        {renderLineNumbers(line, index)}
        <div className={`flex-1 ${getDiffLineClasses(line)}`}>
          <div className="flex items-center">
            {line.type === "add" && <Plus className="h-3 w-3 mr-2 text-green-400" />}
            {line.type === "remove" && <Minus className="h-3 w-3 mr-2 text-red-400" />}
            <span>{showWhitespaceChars(line.content)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSplitView = () => {
    return (
      <div className="grid grid-cols-2 gap-1">
        {/* Old Content */}
        <div className="border-r border-dark-border">
          <div className="bg-red-900/10 px-4 py-2 border-b border-dark-border">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Original</span>
            </div>
          </div>
          <ScrollArea className="max-h-96">
            {diffLines
              .filter(line => line.type !== "add")
              .map((line, index) => (
                <div key={index} className={getDiffLineClasses(line)}>
                  {line.content}
                </div>
              ))}
          </ScrollArea>
        </div>

        {/* New Content */}
        <div>
          <div className="bg-green-900/10 px-4 py-2 border-b border-dark-border">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Modified</span>
            </div>
          </div>
          <ScrollArea className="max-h-96">
            {diffLines
              .filter(line => line.type !== "remove")
              .map((line, index) => (
                <div key={index} className={getDiffLineClasses(line)}>
                  {line.content}
                </div>
              ))}
          </ScrollArea>
        </div>
      </div>
    );
  };

  const renderUnifiedView = () => {
    return (
      <ScrollArea className="max-h-96">
        <div className="border border-dark-border rounded">
          {diffLines.map((line, index) => renderDiffLine(line, index))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="bg-dark-surface border-dark-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <GitCommit className="h-5 w-5" />
            <span>Changes in {filePath}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-400">
              +{stats.additions}
            </Badge>
            <Badge variant="outline" className="text-red-400">
              -{stats.deletions}
            </Badge>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="bg-dark-bg">
              <TabsTrigger value="unified">Unified</TabsTrigger>
              <TabsTrigger value="split">Split</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWhitespace(!showWhitespace)}
              className={showWhitespace ? "bg-dark-bg" : ""}
            >
              <Eye className="h-3 w-3 mr-1" />
              Whitespace
            </Button>
            
            {onRevert && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRevert(filePath)}
                className="text-red-400 hover:text-red-300"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Revert
              </Button>
            )}
            
            {onAcceptChanges && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onAcceptChanges(filePath)}
              >
                Accept Changes
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "split" ? renderSplitView() : renderUnifiedView()}
      </CardContent>
    </Card>
  );
}