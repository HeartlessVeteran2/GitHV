import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function DeviceSelector() {
  const { 
    deviceInfo, 
    setDeviceType, 
    resetToAutoDetect,
    isPhone,
    isTablet,
    isDesktop
  } = useDeviceDetection();
  
  const [showDetails, setShowDetails] = useState(false);

  const deviceOptions: { value: DeviceType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'phone',
      label: 'Phone',
      icon: <Smartphone className="h-4 w-4" />,
      description: 'Mobile-first layout with touch optimizations'
    },
    {
      value: 'tablet',
      label: 'Tablet',
      icon: <Tablet className="h-4 w-4" />,
      description: 'Balanced layout for touch and precision'
    },
    {
      value: 'desktop',
      label: 'Desktop',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Full-featured layout with all panels'
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
            className="h-8 px-2 space-x-1"
          >
            <span className={getStatusColor()}>
              {currentOption?.icon}
            </span>
            <span className="text-xs hidden sm:inline">
              {currentOption?.label}
            </span>
            {deviceInfo.overridden && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                Manual
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Device & Display Settings</span>
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
              {/* Device Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Device Type
                </label>
                <Select 
                  value={deviceInfo.type} 
                  onValueChange={(value: DeviceType) => setDeviceType(value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          {option.icon}
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <span className="text-muted-foreground">Pixel Ratio</span>
                  <span>{deviceInfo.pixelRatio}x</span>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    {/* Network Status */}
                    <div className="flex items-center space-x-1">
                      {deviceInfo.isOnline ? (
                        <Wifi className="h-3 w-3 text-green-400" />
                      ) : (
                        <WifiOff className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {deviceInfo.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    
                    {/* Battery Level (if available) */}
                    {deviceInfo.batteryLevel !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Battery className={`h-3 w-3 ${getBatteryColor()}`} />
                        <span className="text-xs text-muted-foreground">
                          {deviceInfo.batteryLevel}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Device Type Recommendation */}
              {deviceInfo.overridden && deviceInfo.preferredType !== deviceInfo.type && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="font-medium text-blue-700 dark:text-blue-300">
                        Recommendation
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">
                        Based on your screen size, {deviceInfo.preferredType} mode might work better.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Quick Status Indicators */}
      <div className="flex items-center space-x-1">
        {!deviceInfo.isOnline && (
          <div title="Offline">
            <WifiOff className="h-3 w-3 text-red-400" />
          </div>
        )}
        {deviceInfo.batteryLevel !== undefined && deviceInfo.batteryLevel < 20 && (
          <div title={`Battery: ${deviceInfo.batteryLevel}%`}>
            <Battery className="h-3 w-3 text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
}