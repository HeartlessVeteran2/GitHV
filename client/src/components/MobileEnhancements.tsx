import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Smartphone, Tablet, Monitor, Maximize, Minimize,
  RotateCcw, ZoomIn, ZoomOut, Palette, Settings,
  Vibrate, Volume2, VolumeX, Wifi, Battery
} from "lucide-react";

interface MobileEnhancementsProps {
  onAction: (action: string, data?: any) => void;
  zoomLevel: number;
}

export default function MobileEnhancements({ onAction, zoomLevel }: MobileEnhancementsProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Enhanced device detection
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      if (width <= 768) {
        setDeviceType('phone');
      } else if (width <= 1024 || (width <= 1366 && aspectRatio < 1.5)) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
      
      // Update orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    window.addEventListener('orientationchange', updateDeviceType);
    
    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('orientationchange', updateDeviceType);
    };
  }, []);

  // Battery status
  useEffect(() => {
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };

    updateBattery();
  }, []);

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fullscreen management
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
        toast({ title: "Fullscreen Mode", description: "Press ESC to exit fullscreen" });
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  // Haptic feedback
  const triggerVibration = (pattern: number | number[] = 100) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Screen wake lock
  const [wakeLock, setWakeLock] = useState<any>(null);
  
  const toggleWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        if (wakeLock) {
          await wakeLock.release();
          setWakeLock(null);
          toast({ title: "Screen Lock", description: "Screen can now turn off automatically" });
        } else {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLock(lock);
          toast({ title: "Screen Lock", description: "Screen will stay awake while coding" });
        }
      }
    } catch (error) {
      console.log('Wake Lock not supported');
    }
  };

  // Auto-save with visual feedback
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  useEffect(() => {
    if (autoSaveEnabled && isMobile) {
      const interval = setInterval(() => {
        onAction('auto-save');
        setLastSaved(new Date());
        triggerVibration(50); // Subtle feedback
      }, 30000); // Auto-save every 30 seconds on mobile

      return () => clearInterval(interval);
    }
  }, [autoSaveEnabled, isMobile, onAction]);

  // Enhanced gestures for mobile
  const enhancedGestureActions = {
    'swipe-up-with-two-fingers': () => {
      onAction('toggle-ai');
      triggerVibration([50, 50, 50]);
    },
    'swipe-down-with-two-fingers': () => {
      onAction('toggle-terminal');
      triggerVibration([50, 50]);
    },
    'three-finger-tap': () => {
      onAction('toggle-file-tree');
      triggerVibration([100, 50, 100]);
    },
    'pinch-out': () => {
      onAction('zoom-in');
      triggerVibration(25);
    },
    'pinch-in': () => {
      onAction('zoom-out');
      triggerVibration(25);
    }
  };

  if (!isMobile) return null;

  return (
    <div className="fixed top-2 right-2 z-50 flex flex-col items-end space-y-2">
      {/* Device Status Indicators */}
      <div className="flex items-center space-x-1 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
        {/* Device Type Indicator */}
        <div className="flex items-center space-x-1">
          {deviceType === 'phone' && <Smartphone className="h-3 w-3 text-blue-400" />}
          {deviceType === 'tablet' && <Tablet className="h-3 w-3 text-green-400" />}
          {deviceType === 'desktop' && <Monitor className="h-3 w-3 text-gray-400" />}
        </div>

        {/* Orientation */}
        <Badge variant="outline" className="text-xs h-5">
          {orientation === 'portrait' ? 'P' : 'L'}
        </Badge>

        {/* Zoom Level */}
        <Badge variant="outline" className="text-xs h-5">
          {zoomLevel}%
        </Badge>

        {/* Battery Status */}
        <div className="flex items-center space-x-1">
          <Battery className="h-3 w-3 text-green-400" />
          <span className="text-xs text-white">{batteryLevel}%</span>
        </div>

        {/* Network Status */}
        <Wifi className={`h-3 w-3 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
      </div>

      {/* Quick Mobile Actions */}
      <div className="flex flex-col space-y-1">
        {/* Fullscreen Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0 bg-black/80 backdrop-blur-sm border-gray-600"
          title="Toggle Fullscreen"
        >
          {fullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
        </Button>

        {/* Vibration Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setVibrationEnabled(!vibrationEnabled);
            if (vibrationEnabled) triggerVibration(200);
          }}
          className={`h-8 w-8 p-0 bg-black/80 backdrop-blur-sm border-gray-600 ${
            vibrationEnabled ? 'text-blue-400' : 'text-gray-400'
          }`}
          title="Toggle Vibration"
        >
          <Vibrate className="h-3 w-3" />
        </Button>

        {/* Sound Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`h-8 w-8 p-0 bg-black/80 backdrop-blur-sm border-gray-600 ${
            soundEnabled ? 'text-green-400' : 'text-gray-400'
          }`}
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </Button>

        {/* Rotate Screen Hint */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast({
              title: "Rotate Device",
              description: `Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'} for better experience`
            });
            triggerVibration([100, 50, 100]);
          }}
          className="h-8 w-8 p-0 bg-black/80 backdrop-blur-sm border-gray-600"
          title="Rotation Suggestion"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* Auto-save Indicator */}
      {autoSaveEnabled && (
        <div className="bg-green-600/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
          Auto-saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago
        </div>
      )}

      {/* Gesture Hints */}
      {deviceType === 'phone' && (
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 text-xs text-white max-w-[200px]">
          <div className="font-medium mb-1">Gestures:</div>
          <div>• 2-finger swipe up: AI</div>
          <div>• 2-finger swipe down: Terminal</div>
          <div>• 3-finger tap: Files</div>
          <div>• Pinch: Zoom</div>
        </div>
      )}
    </div>
  );
}