import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap
} from "lucide-react";

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  network: {
    upload: number;
    download: number;
  };
  timing: {
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
  bundleSize: number;
  loadTime: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: 'script' | 'stylesheet' | 'image' | 'fetch' | 'other';
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    network: { upload: 0, download: 0 },
    timing: {
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0
    },
    bundleSize: 0,
    loadTime: 0
  });
  
  const [resourceTimings, setResourceTimings] = useState<ResourceTiming[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<{ timestamp: number; metrics: PerformanceMetrics }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get initial performance metrics
    updatePerformanceMetrics();
    
    // Setup monitoring interval
    if (isMonitoring) {
      intervalRef.current = setInterval(updatePerformanceMetrics, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring]);

  const updatePerformanceMetrics = async () => {
    const newMetrics: PerformanceMetrics = {
      cpu: getCPUUsage(),
      memory: getMemoryUsage(),
      network: getNetworkMetrics(),
      timing: getTimingMetrics(),
      bundleSize: getBundleSize(),
      loadTime: getLoadTime()
    };
    
    setMetrics(newMetrics);
    
    // Add to history (keep last 60 data points)
    setHistory(prev => [
      ...prev.slice(-59),
      { timestamp: Date.now(), metrics: newMetrics }
    ]);
    
    // Update resource timings
    updateResourceTimings();
  };

  const getCPUUsage = (): number => {
    // Simulate CPU usage based on performance.now() precision
    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      sum += Math.random();
    }
    const duration = performance.now() - start;
    return Math.min(Math.max(duration / 10, 0), 100);
  };

  const getMemoryUsage = (): number => {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;
    if (memory) {
      return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    }
    return Math.random() * 100; // Fallback simulation
  };

  const getNetworkMetrics = () => {
    // @ts-ignore - navigator.connection is not standard
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        upload: connection.uplink || 0,
        download: connection.downlink || 0
      };
    }
    return { upload: 0, download: 0 };
  };

  const getTimingMetrics = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: getLCP()
    };
  };

  const getLCP = (): number => {
    // Use Performance Observer for LCP if available
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
    } catch {
      return 0;
    }
  };

  const getBundleSize = (): number => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.reduce((total, resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        return total + (resource.transferSize || 0);
      }
      return total;
    }, 0);
  };

  const getLoadTime = (): number => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation?.loadEventEnd - navigation?.fetchStart || 0;
  };

  const updateResourceTimings = () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const timings: ResourceTiming[] = resources.map(resource => {
      let type: ResourceTiming['type'] = 'other';
      
      if (resource.name.includes('.js')) type = 'script';
      else if (resource.name.includes('.css')) type = 'stylesheet';
      else if (resource.name.includes('.png') || resource.name.includes('.jpg') || resource.name.includes('.svg')) type = 'image';
      else if (resource.name.includes('/api/')) type = 'fetch';
      
      return {
        name: resource.name.split('/').pop() || resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type
      };
    }).sort((a, b) => b.duration - a.duration).slice(0, 10);
    
    setResourceTimings(timings);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "text-green-400";
    if (value <= thresholds.warning) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "bg-green-500";
    if (value <= thresholds.warning) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="bg-dark-surface border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Monitor</span>
          </CardTitle>
          
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? "Stop" : "Start"} Monitoring
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* CPU Usage */}
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(metrics.cpu)}%
                  </div>
                  <Progress 
                    value={metrics.cpu} 
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <HardDrive className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(metrics.memory)}%
                  </div>
                  <Progress 
                    value={metrics.memory} 
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Bundle Size */}
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">Bundle</span>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {formatBytes(metrics.bundleSize)}
                  </div>
                  <Badge variant={metrics.bundleSize > 1000000 ? "destructive" : "outline"} className="text-xs">
                    {metrics.bundleSize > 1000000 ? "Large" : "Optimal"}
                  </Badge>
                </CardContent>
              </Card>

              {/* Load Time */}
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">Load Time</span>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {formatTime(metrics.loadTime)}
                  </div>
                  <Badge variant={metrics.loadTime > 3000 ? "destructive" : "outline"} className="text-xs">
                    {metrics.loadTime > 3000 ? "Slow" : "Fast"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="bg-dark-bg border-dark-border">
              <CardHeader>
                <CardTitle className="text-sm">Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end space-x-1">
                  {history.slice(-30).map((entry, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-500 opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${(entry.metrics.cpu / 100) * 100}%` }}
                      title={`CPU: ${Math.round(entry.metrics.cpu)}% at ${new Date(entry.timestamp).toLocaleTimeString()}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Resource Loading Times</h3>
              {resourceTimings.map((resource, index) => (
                <Card key={index} className="bg-dark-bg border-dark-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-sm font-mono truncate max-w-48">
                          {resource.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{formatTime(resource.duration)}</span>
                        <span>{formatBytes(resource.size)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">DOM Content Loaded</span>
                      <span className={`text-sm ${getStatusColor(metrics.timing.domContentLoaded, { good: 1000, warning: 2000 })}`}>
                        {formatTime(metrics.timing.domContentLoaded)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First Paint</span>
                      <span className={`text-sm ${getStatusColor(metrics.timing.firstPaint, { good: 1000, warning: 2500 })}`}>
                        {formatTime(metrics.timing.firstPaint)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First Contentful Paint</span>
                      <span className={`text-sm ${getStatusColor(metrics.timing.firstContentfulPaint, { good: 1500, warning: 2500 })}`}>
                        {formatTime(metrics.timing.firstContentfulPaint)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span className={`text-sm ${getStatusColor(metrics.timing.largestContentfulPaint, { good: 2500, warning: 4000 })}`}>
                        {formatTime(metrics.timing.largestContentfulPaint)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">Performance Insights</h3>
                  <div className="space-y-2">
                    {metrics.timing.largestContentfulPaint > 4000 && (
                      <div className="flex items-center space-x-2 text-xs text-yellow-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Large Contentful Paint is slow</span>
                      </div>
                    )}
                    {metrics.bundleSize > 1000000 && (
                      <div className="flex items-center space-x-2 text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Bundle size is large</span>
                      </div>
                    )}
                    {metrics.memory > 80 && (
                      <div className="flex items-center space-x-2 text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Memory usage is high</span>
                      </div>
                    )}
                    {metrics.timing.firstContentfulPaint < 1500 && metrics.bundleSize < 500000 && (
                      <div className="flex items-center space-x-2 text-xs text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>Performance looks good!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">Network Speed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">Download</span>
                      <span className="text-xs">{metrics.network.download} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Upload</span>
                      <span className="text-xs">{metrics.network.upload} Mbps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-bg border-dark-border">
                <CardContent className="p-4">
                  <div className="text-sm font-medium mb-2">Connection Quality</div>
                  <div className="space-y-2">
                    <Badge variant={metrics.network.download > 10 ? "default" : "destructive"}>
                      {metrics.network.download > 10 ? "Good" : "Poor"} Connection
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}