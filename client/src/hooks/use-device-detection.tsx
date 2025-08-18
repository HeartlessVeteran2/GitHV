import { useState, useEffect } from 'react';

export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
  isTouch: boolean;
  pixelRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  batteryLevel?: number;
  isOnline: boolean;
  platform: string;
  userAgent: string;
  autoDetected: boolean;
  overridden: boolean;
  preferredType?: DeviceType;
}

const DEVICE_BREAKPOINTS = {
  phone: { max: 768 },
  tablet: { min: 768, max: 1024 },
  desktop: { min: 1024 }
};

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'landscape',
    screenWidth: 0,
    screenHeight: 0,
    isTouch: false,
    pixelRatio: 1,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isOnline: true,
    platform: '',
    userAgent: '',
    autoDetected: true,
    overridden: false
  });

  const [manualOverride, setManualOverride] = useState<DeviceType | null>(null);

  const detectDevice = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    // Auto-detect device type based on multiple factors
    let autoDetectedType: DeviceType = 'desktop';
    
    if (width <= DEVICE_BREAKPOINTS.phone.max) {
      autoDetectedType = 'phone';
    } else if (width <= DEVICE_BREAKPOINTS.tablet.max) {
      // Additional checks for tablet vs desktop
      if (isTouch || /iPad|Android|Tablet/i.test(userAgent) || pixelRatio > 1.5) {
        autoDetectedType = 'tablet';
      } else {
        autoDetectedType = 'desktop';
      }
    } else {
      autoDetectedType = 'desktop';
    }

    // Use manual override if set, otherwise use auto-detection
    const finalType = manualOverride || autoDetectedType;

    const newDeviceInfo: DeviceInfo = {
      type: finalType,
      orientation,
      screenWidth: width,
      screenHeight: height,
      isTouch,
      pixelRatio,
      isMobile: finalType === 'phone',
      isTablet: finalType === 'tablet',
      isDesktop: finalType === 'desktop',
      isOnline: navigator.onLine,
      platform,
      userAgent,
      autoDetected: !manualOverride,
      overridden: !!manualOverride,
      preferredType: autoDetectedType
    };

    setDeviceInfo(newDeviceInfo);
  };

  useEffect(() => {
    detectDevice();

    const handleResize = () => detectDevice();
    const handleOrientationChange = () => {
      // Delay to allow orientation change to complete
      setTimeout(detectDevice, 100);
    };
    const handleOnline = () => setDeviceInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDeviceInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setDeviceInfo(prev => ({ 
            ...prev, 
            batteryLevel: Math.round(battery.level * 100) 
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
      }).catch(() => {
        // Battery API not supported
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [manualOverride]);

  const setDeviceType = (type: DeviceType) => {
    setManualOverride(type);
    localStorage.setItem('preferred-device-type', type);
  };

  const resetToAutoDetect = () => {
    setManualOverride(null);
    localStorage.removeItem('preferred-device-type');
  };

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-device-type') as DeviceType;
    if (saved && ['phone', 'tablet', 'desktop'].includes(saved)) {
      setManualOverride(saved);
    }
  }, []);

  return {
    deviceInfo,
    setDeviceType,
    resetToAutoDetect,
    isPhone: deviceInfo.type === 'phone',
    isTablet: deviceInfo.type === 'tablet',
    isDesktop: deviceInfo.type === 'desktop',
    isMobile: deviceInfo.type === 'phone',
    isTouchDevice: deviceInfo.isTouch,
    orientation: deviceInfo.orientation,
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape'
  };
}

// CSS classes for responsive design
export const getDeviceClasses = (deviceInfo: DeviceInfo) => {
  const baseClasses = [
    `device-${deviceInfo.type}`,
    `orientation-${deviceInfo.orientation}`,
    deviceInfo.isTouch ? 'touch-device' : 'no-touch',
    deviceInfo.isOnline ? 'online' : 'offline'
  ];

  return baseClasses.join(' ');
};

// Responsive breakpoint utilities
export const useResponsiveValue = <T,>(values: {
  phone?: T;
  tablet?: T;
  desktop: T;
}) => {
  const { deviceInfo } = useDeviceDetection();
  
  if (deviceInfo.type === 'phone' && values.phone !== undefined) {
    return values.phone;
  }
  if (deviceInfo.type === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.desktop;
};