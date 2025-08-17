import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, X, ChevronRight, Bot, Zap, MessageSquare, 
  Code, TestTube, FileText, Sparkles, ArrowRight, Check
} from "lucide-react";

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'getting-started' | 'personalities' | 'suggestions' | 'chat' | 'advanced';
  priority: 'high' | 'medium' | 'low';
  trigger?: 'first-open' | 'no-suggestions' | 'personality-change' | 'manual';
}

const tips: Tip[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your AI Assistant',
    description: 'Your AI assistant can help with code suggestions, explanations, debugging, and more. Click the floating AI button to get started.',
    icon: <Bot className="h-5 w-5" />,
    category: 'getting-started',
    priority: 'high',
    trigger: 'first-open'
  },
  {
    id: 'personality-selector',
    title: 'Choose Your AI Personality',
    description: 'Click the settings button (⚙️) in the AI assistant to choose from 6 different personalities, each with unique communication styles and specialties.',
    icon: <Sparkles className="h-5 w-5" />,
    category: 'personalities',
    priority: 'high',
    trigger: 'first-open'
  },
  {
    id: 'code-suggestions',
    title: 'Smart Code Suggestions',
    description: 'The AI automatically analyzes your code and provides intelligent suggestions for completions, refactoring, bug fixes, and optimizations.',
    icon: <Lightbulb className="h-5 w-5" />,
    category: 'suggestions',
    priority: 'medium'
  },
  {
    id: 'quick-actions',
    title: 'Quick Action Buttons',
    description: 'Use the quick action buttons to instantly ask the AI to explain code, find bugs, optimize performance, or generate tests.',
    icon: <Zap className="h-5 w-5" />,
    category: 'suggestions',
    priority: 'medium'
  },
  {
    id: 'chat-mode',
    title: 'Interactive Chat',
    description: 'Switch to chat mode to have a conversation with your AI assistant. Ask questions, get explanations, or brainstorm solutions.',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'chat',
    priority: 'medium'
  },
  {
    id: 'context-aware',
    title: 'Context-Aware Responses',
    description: 'The AI understands your current file, cursor position, and selected text to provide more relevant and accurate suggestions.',
    icon: <Code className="h-5 w-5" />,
    category: 'advanced',
    priority: 'low'
  },
  {
    id: 'copy-apply',
    title: 'Copy & Apply Code',
    description: 'Easily copy suggested code to clipboard or apply it directly to your file using the action buttons on each suggestion.',
    icon: <Check className="h-5 w-5" />,
    category: 'advanced',
    priority: 'medium'
  },
  {
    id: 'test-generation',
    title: 'Automatic Test Generation',
    description: 'Ask the AI to generate unit tests for your functions and classes. It understands your code structure and testing frameworks.',
    icon: <TestTube className="h-5 w-5" />,
    category: 'advanced',
    priority: 'low'
  }
];

interface AITipsProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
  onTipComplete?: (tipId: string) => void;
}

export default function AITips({ isOpen, onClose, trigger, onTipComplete }: AITipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tips based on trigger and category
  const filteredTips = tips.filter(tip => {
    const categoryMatch = selectedCategory === 'all' || tip.category === selectedCategory;
    const triggerMatch = !trigger || tip.trigger === trigger || tip.trigger === undefined;
    return categoryMatch && triggerMatch;
  });

  const currentTip = filteredTips[currentTipIndex];

  useEffect(() => {
    // Load completed tips from localStorage
    const saved = localStorage.getItem('ai-tips-completed');
    if (saved) {
      setCompletedTips(JSON.parse(saved));
    }
  }, []);

  const markTipComplete = (tipId: string) => {
    const newCompleted = [...completedTips, tipId];
    setCompletedTips(newCompleted);
    localStorage.setItem('ai-tips-completed', JSON.stringify(newCompleted));
    onTipComplete?.(tipId);
  };

  const nextTip = () => {
    if (currentTipIndex < filteredTips.length - 1) {
      setCurrentTipIndex(prev => prev + 1);
    }
  };

  const previousTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(prev => prev - 1);
    }
  };

  const categories = [
    { id: 'all', name: 'All Tips', count: tips.length },
    { id: 'getting-started', name: 'Getting Started', count: tips.filter(t => t.category === 'getting-started').length },
    { id: 'personalities', name: 'Personalities', count: tips.filter(t => t.category === 'personalities').length },
    { id: 'suggestions', name: 'Suggestions', count: tips.filter(t => t.category === 'suggestions').length },
    { id: 'chat', name: 'Chat', count: tips.filter(t => t.category === 'chat').length },
    { id: 'advanced', name: 'Advanced', count: tips.filter(t => t.category === 'advanced').length },
  ];

  if (!isOpen || !currentTip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-text">AI Assistant Tips</h2>
                <p className="text-gray-400 mt-1">Learn how to get the most from your AI assistant</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentTipIndex(0);
                }}
                className="text-xs"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Current Tip */}
          <Card className="border-dark-border bg-dark-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    {currentTip.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-dark-text">
                      {currentTip.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          currentTip.priority === 'high' ? 'border-red-500 text-red-400' :
                          currentTip.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                          'border-gray-500 text-gray-400'
                        }`}
                      >
                        {currentTip.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {currentTip.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                {completedTips.includes(currentTip.id) && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed mb-4">
                {currentTip.description}
              </p>
              
              {/* Interactive Elements Based on Tip */}
              {currentTip.id === 'personality-selector' && (
                <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">Try this:</span>
                  </div>
                  <p>Look for the ⚙️ settings button in the AI assistant header when it's open</p>
                </div>
              )}

              {currentTip.id === 'quick-actions' && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-300 mb-2">Available quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <FileText className="h-3 w-3 text-blue-400" />
                      <span>Explain code</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <TestTube className="h-3 w-3 text-green-400" />
                      <span>Add tests</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <span>Optimize</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Code className="h-3 w-3 text-purple-400" />
                      <span>Find bugs</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress and Navigation */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {currentTipIndex + 1} of {filteredTips.length}
              </span>
              <div className="flex space-x-1">
                {filteredTips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentTipIndex ? 'bg-blue-500' :
                      index < currentTipIndex ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!completedTips.includes(currentTip.id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markTipComplete(currentTip.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Got it
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={previousTip}
                disabled={currentTipIndex === 0}
              >
                Previous
              </Button>
              
              {currentTipIndex < filteredTips.length - 1 ? (
                <Button
                  size="sm"
                  onClick={nextTip}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}