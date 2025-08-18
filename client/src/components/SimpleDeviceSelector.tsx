import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Smartphone, Tablet, Monitor, Wifi, WifiOff, Battery,
  RotateCcw, Settings, Info, Check, X
} from 'lucide-react';
import { useDeviceDetection, type DeviceType } from '@/hooks/use-device-detection';

export default function SimpleDeviceSelector() {
  const { 
    deviceInfo, 
    setDeviceType, 
    resetToAutoDetect,
    isPhone,
    isTablet,
    isDesktop
  } = useDeviceDetection();
  
  const [showDetails, setShowDetails] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDetails]);

  const deviceOptions: { value: DeviceType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'phone',
      label: 'Phone',
      icon: <Smartphone className="h-4 w-4" />,
      description: 'Mobile-first layout'
    },
    {
      value: 'tablet',
      label: 'Tablet',
      icon: <Tablet className="h-4 w-4" />,
      description: 'Balanced layout'
    },
    {
      value: 'desktop',
      label: 'Desktop',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Full-featured layout'
    }
  ];

  const currentOption = deviceOptions.find(option => option.value === deviceInfo.type);

  const getStatusColor = () => {
    if (deviceInfo.overridden) return 'text-blue-400';
    if (deviceInfo.autoDetected) return 'text-green-400';
    return 'text-gray-400';
  };

  const getBatteryColor = () => {
    if (!deviceInfo.batteryLevel) return 'text-gray-400';
    if (deviceInfo.batteryLevel > 50) return 'text-green-400';
    if (deviceInfo.batteryLevel > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Device Type Indicator */}
      <Popover open={showDetails} onOpenChange={setShowDetails}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 h-8 px-2"
          >
            {currentOption?.icon}
            <span className="text-xs font-medium">{currentOption?.label}</span>
            <Badge 
              variant="secondary" 
              className={`text-xs h-4 px-1 ${getStatusColor()}`}
            >
              {deviceInfo.autoDetected ? 'Auto' : 'Manual'}
            </Badge>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Device Settings</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Device Type Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Device Type
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {deviceOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={deviceInfo.type === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceType(option.value)}
                      className="flex flex-col h-auto p-2"
                    >
                      {option.icon}
                      <span className="text-xs mt-1">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-detect vs Manual */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {deviceInfo.autoDetected ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Settings className="h-3 w-3 text-blue-400" />
                  )}
                  <span className="text-xs">
                    {deviceInfo.autoDetected ? 'Auto-detected' : 'Manual override'}
                  </span>
                </div>
                {deviceInfo.overridden && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToAutoDetect}
                    className="h-6 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Device Information */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Screen</span>
                  <span>
                    {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Orientation</span>
                  <span className="capitalize">{deviceInfo.orientation}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Touch Support</span>
                  <span>{deviceInfo.isTouch ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Connection</span>
                  <div className="flex items-center space-x-1">
                    {deviceInfo.isOnline ? (
                      <Wifi className="h-3 w-3 text-green-400" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-400" />
                    )}
                    <span>{deviceInfo.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                {deviceInfo.batteryLevel && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Battery</span>
                    <div className="flex items-center space-x-1">
                      <Battery className={`h-3 w-3 ${getBatteryColor()}`} />
                      <span>{Math.round(deviceInfo.batteryLevel * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Performance Indicator */}
      <Badge variant="outline" className="text-xs h-6 px-2">
        {isPhone && 'Mobile'}
        {isTablet && 'Tablet'}
        {isDesktop && 'Desktop'}
      </Badge>
    </div>
  );
}