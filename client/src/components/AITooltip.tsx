import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Info, Lightbulb } from "lucide-react";

interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface AITooltipProps {
  isVisible: boolean;
  position: TooltipPosition;
  title: string;
  content: string;
  type: 'info' | 'tip' | 'warning' | 'success';
  onClose: () => void;
  onAction?: () => void;
  actionText?: string;
  showPointer?: boolean;
}

const tooltipStyles = {
  info: 'border-blue-500 bg-blue-950/90',
  tip: 'border-yellow-500 bg-yellow-950/90',
  warning: 'border-orange-500 bg-orange-950/90',
  success: 'border-green-500 bg-green-950/90'
};

const tooltipIcons = {
  info: <Info className="h-4 w-4 text-blue-400" />,
  tip: <Lightbulb className="h-4 w-4 text-yellow-400" />,
  warning: <Info className="h-4 w-4 text-orange-400" />,
  success: <Info className="h-4 w-4 text-green-400" />
};

export default function AITooltip({ 
  isVisible, 
  position, 
  title, 
  content, 
  type, 
  onClose, 
  onAction, 
  actionText,
  showPointer = true 
}: AITooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!mounted) return null;

  const getTooltipStyle = () => {
    let transform = '';
    let left = position.x;
    let top = position.y;

    switch (position.placement) {
      case 'top':
        transform = 'translate(-50%, -100%)';
        left = position.x;
        top = position.y - 10;
        break;
      case 'bottom':
        transform = 'translate(-50%, 0%)';
        left = position.x;
        top = position.y + 10;
        break;
      case 'left':
        transform = 'translate(-100%, -50%)';
        left = position.x - 10;
        top = position.y;
        break;
      case 'right':
        transform = 'translate(0%, -50%)';
        left = position.x + 10;
        top = position.y;
        break;
    }

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      transform,
      zIndex: 1000
    };
  };

  const getPointerStyle = () => {
    const baseClass = "absolute w-0 h-0 border-solid";
    const borderColor = type === 'info' ? 'border-blue-500' :
                       type === 'tip' ? 'border-yellow-500' :
                       type === 'warning' ? 'border-orange-500' :
                       'border-green-500';

    switch (position.placement) {
      case 'top':
        return `${baseClass} border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${borderColor} top-full left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClass} border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent ${borderColor} bottom-full left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClass} border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent ${borderColor} left-full top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClass} border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent ${borderColor} right-full top-1/2 -translate-y-1/2`;
      default:
        return '';
    }
  };

  return (
    <div 
      style={getTooltipStyle()}
      className={`transition-all duration-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <Card className={`${tooltipStyles[type]} backdrop-blur-sm border-2 shadow-xl max-w-xs`}>
        {showPointer && (
          <div className={getPointerStyle()} />
        )}
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {tooltipIcons[type]}
              <h4 className="font-medium text-white text-sm">{title}</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-4 w-4 p-0 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
            {content}
          </p>
          
          {onAction && actionText && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={onAction}
                className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
              >
                {actionText}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing tooltips
export function useAITooltips() {
  const [tooltips, setTooltips] = useState<(AITooltipProps & { id: string })[]>([]);

  const showTooltip = (tooltip: Omit<AITooltipProps, 'isVisible' | 'onClose'> & { id: string, duration?: number }) => {
    const newTooltip = {
      ...tooltip,
      isVisible: true,
      onClose: () => hideTooltip(tooltip.id)
    };

    setTooltips(prev => [...prev.filter(t => t.id !== tooltip.id), newTooltip]);

    if (tooltip.duration) {
      setTimeout(() => hideTooltip(tooltip.id), tooltip.duration);
    }
  };

  const hideTooltip = (id: string) => {
    setTooltips(prev => prev.map(tooltip => 
      tooltip.id === id ? { ...tooltip, isVisible: false } : tooltip
    ));

    setTimeout(() => {
      setTooltips(prev => prev.filter(t => t.id !== id));
    }, 200);
  };

  const hideAllTooltips = () => {
    setTooltips(prev => prev.map(tooltip => ({ ...tooltip, isVisible: false })));
    setTimeout(() => setTooltips([]), 200);
  };

  return {
    tooltips,
    showTooltip,
    hideTooltip,
    hideAllTooltips
  };
}