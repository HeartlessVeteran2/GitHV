// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }
  
  return new IntersectionObserver(callback, options);
};

// Memory optimization
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Virtual scrolling utility
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private bufferSize: number;
  
  constructor(container: HTMLElement, itemHeight: number, bufferSize = 5) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.bufferSize = bufferSize;
  }
  
  getVisibleRange(scrollTop: number, containerHeight: number, totalItems: number) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
    );
    
    return { startIndex, endIndex };
  }
}

// Bundle size optimization
export const loadComponent = async (importFn: () => Promise<any>) => {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.error('Failed to load component:', error);
    return null;
  }
};

// Network optimization
export const preconnect = (url: string) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
};

export const prefetch = (url: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// Battery and performance monitoring
export const getBatteryInfo = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  return null;
};

export const getDeviceMemory = () => {
  return (navigator as any).deviceMemory || null;
};

export const getConnectionInfo = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Performance measurement
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  
  start(name: string) {
    performance.mark(`${name}-start`);
  }
  
  end(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      const duration = measure.duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      return duration;
    }
    
    return 0;
  }
  
  getAverageTime(name: string) {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }
  
  getMetrics() {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((measurements, name) => {
      result[name] = {
        average: this.getAverageTime(name),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0
      };
    });
    
    return result;
  }
}

export const performanceTracker = new PerformanceTracker();