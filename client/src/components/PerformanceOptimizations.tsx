import { useEffect, useState, useCallback } from 'react';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { performanceTracker, getBatteryInfo, getConnectionInfo } from '@/lib/performance';

// Service Worker registration for caching
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
};

// Memory management
const optimizeMemory = () => {
  // Clear performance entries periodically
  if (performance.getEntries().length > 1000) {
    performance.clearResourceTimings();
  }

  // Force garbage collection if available
  if ((window as any).gc) {
    (window as any).gc();
  }
};

// Battery optimization
const optimizeForBattery = (batteryLevel: number | null, isCharging: boolean) => {
  if (batteryLevel === null) return {};

  const isLowBattery = batteryLevel < 0.2;
  const isCriticalBattery = batteryLevel < 0.1;

  return {
    // Reduce animations and transitions
    reduceMotion: isLowBattery,
    // Disable heavy features
    disableAnimations: isCriticalBattery,
    // Reduce update frequency
    updateInterval: isLowBattery ? 1000 : 500,
    // Limit background processing
    limitBackgroundTasks: isLowBattery
  };
};

// Network optimization
const optimizeForConnection = (connectionInfo: any) => {
  if (!connectionInfo) return {};

  const isSlowConnection = connectionInfo.effectiveType === 'slow-2g' || connectionInfo.effectiveType === '2g';
  const isSaveDataEnabled = connectionInfo.saveData;

  return {
    // Reduce image quality
    imageQuality: isSlowConnection ? 'low' : 'high',
    // Defer non-critical resources
    deferResources: isSlowConnection || isSaveDataEnabled,
    // Compress data
    compressionLevel: isSlowConnection ? 'high' : 'medium',
    // Limit concurrent requests
    maxConcurrentRequests: isSlowConnection ? 2 : 6
  };
};

export default function PerformanceOptimizations() {
  const { deviceInfo, isPhone } = useDeviceDetection();
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [optimizations, setOptimizations] = useState<any>({});

  // Initialize performance optimizations
  useEffect(() => {
    registerServiceWorker();
    
    // Memory cleanup interval
    const memoryCleanup = setInterval(optimizeMemory, 30000);
    
    return () => clearInterval(memoryCleanup);
  }, []);

  // Monitor battery status
  useEffect(() => {
    const updateBatteryInfo = async () => {
      const battery = await getBatteryInfo();
      setBatteryInfo(battery);
    };

    updateBatteryInfo();
    
    // Update battery info every minute
    const batteryInterval = setInterval(updateBatteryInfo, 60000);
    
    return () => clearInterval(batteryInterval);
  }, []);

  // Monitor connection status
  useEffect(() => {
    const connection = getConnectionInfo();
    setConnectionInfo(connection);

    const handleConnectionChange = () => {
      const newConnection = getConnectionInfo();
      setConnectionInfo(newConnection);
    };

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, []);

  // Calculate optimizations
  useEffect(() => {
    const batteryOptimizations = optimizeForBattery(
      batteryInfo?.level || null,
      batteryInfo?.charging || false
    );
    
    const networkOptimizations = optimizeForConnection(connectionInfo);
    
    const deviceOptimizations = {
      // Phone-specific optimizations
      virtualScrolling: isPhone,
      lazyLoading: true,
      imageOptimization: isPhone ? 'aggressive' : 'standard',
      // Reduce JavaScript execution on low-end devices
      reducedJSExecution: isPhone && deviceInfo.screenWidth < 400,
      // Touch optimizations
      touchOptimizations: deviceInfo.isTouch
    };

    setOptimizations({
      ...batteryOptimizations,
      ...networkOptimizations,
      ...deviceOptimizations
    });
  }, [batteryInfo, connectionInfo, isPhone, deviceInfo]);

  // Apply CSS optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply performance-based CSS custom properties
    if (optimizations.reduceMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }

    if (optimizations.disableAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Apply device-specific optimizations
    if (optimizations.touchOptimizations) {
      root.classList.add('touch-optimized');
    }

    if (optimizations.virtualScrolling) {
      root.classList.add('virtual-scrolling');
    }
  }, [optimizations]);

  // Performance monitoring
  useEffect(() => {
    const logPerformance = () => {
      const metrics = performanceTracker.getMetrics();
      console.log('Performance metrics:', metrics);
    };

    const performanceInterval = setInterval(logPerformance, 30000);
    
    return () => clearInterval(performanceInterval);
  }, []);

  return null; // This is a utility component with no visual output
}

// CSS optimizations for performance
export const performanceCSS = `
  /* Reduce motion for performance */
  .no-animations * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }

  /* Touch optimizations */
  .touch-optimized {
    touch-action: manipulation;
  }

  .touch-optimized button,
  .touch-optimized .clickable {
    min-height: 44px;
    min-width: 44px;
  }

  /* GPU acceleration for smooth scrolling */
  .gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Virtual scrolling container */
  .virtual-scrolling .scroll-container {
    contain: layout style paint;
    overflow-anchor: none;
  }

  /* Image optimization */
  .optimized-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  /* Reduce layout thrashing */
  .layout-optimized {
    contain: layout;
  }

  /* Memory efficient animations */
  .efficient-animation {
    will-change: transform, opacity;
  }

  .efficient-animation:not(:hover):not(:focus) {
    will-change: auto;
  }
`;