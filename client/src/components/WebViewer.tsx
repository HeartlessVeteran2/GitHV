import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Maximize2, Minimize2, RotateCcw, Home, X,
  Lock, Unlock, Code, Monitor, Smartphone, Tablet,
  RefreshCw, ExternalLink, Download, Share2, Zap
} from "lucide-react";

interface WebViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  theme?: 'dark' | 'light';
}

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  userAgent: string;
}

const devicePresets: DevicePreset[] = [
  {
    name: "Desktop",
    width: 1920,
    height: 1080,
    icon: <Monitor className="h-3 w-3" />,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  {
    name: "Tablet",
    width: 768,
    height: 1024,
    icon: <Tablet className="h-3 w-3" />,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15"
  },
  {
    name: "Mobile",
    width: 375,
    height: 667,
    icon: <Smartphone className="h-3 w-3" />,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15"
  }
];

export default function WebViewer({ isOpen, onClose, initialUrl = "about:blank", theme = 'dark' }: WebViewerProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[0]);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [sourceCode, setSourceCode] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update URL input when currentUrl changes
  useEffect(() => {
    setInputUrl(currentUrl);
    setIsSecure(currentUrl.startsWith('https://'));
  }, [currentUrl]);

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      try {
        // Try to get the current URL from iframe (may fail due to CORS)
        const iframeUrl = iframe.contentWindow?.location.href;
        if (iframeUrl && iframeUrl !== 'about:blank') {
          setCurrentUrl(iframeUrl);
        }
      } catch (e) {
        // CORS restriction, URL update handled elsewhere
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('loadstart', handleLoadStart);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const navigateToUrl = (url: string) => {
    if (!url) return;
    
    // Add protocol if missing
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
      formattedUrl = url.includes('localhost') || url.includes('127.0.0.1') 
        ? `http://${url}` 
        : `https://${url}`;
    }
    
    setCurrentUrl(formattedUrl);
    setIsLoading(true);
    
    if (iframeRef.current) {
      iframeRef.current.src = formattedUrl;
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(inputUrl);
  };

  const refreshPage = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    navigateToUrl('http://localhost:5000');
  };

  const openInNewTab = () => {
    window.open(currentUrl, '_blank');
  };

  const fetchSourceCode = async () => {
    if (!currentUrl || currentUrl === 'about:blank') return;
    
    try {
      const response = await fetch(currentUrl);
      const html = await response.text();
      setSourceCode(html);
    } catch (error) {
      setSourceCode(`Error fetching source: ${error}`);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'preview') {
      setViewMode('source');
      fetchSourceCode();
    } else {
      setViewMode('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${
        isMaximized ? 'fixed inset-0 z-50' : 'h-full'
      } ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } flex flex-col border`}
      ref={containerRef}
    >
      {/* Browser Header */}
      <div className={`flex items-center justify-between px-2 py-1 ${
        theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 flex-1">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={refreshPage}
              title="Refresh"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={goHome}
              title="Home (localhost:5000)"
            >
              <Home className="h-3 w-3" />
            </Button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-lg">
            <div className="relative">
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="pl-8 pr-8 h-7 text-xs"
                placeholder="Enter URL or localhost:5000"
              />
              <div className="absolute left-2 top-1.5">
                {isSecure ? (
                  <Lock className="h-3 w-3 text-green-500" />
                ) : (
                  <Unlock className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-0.5 h-5 w-5 p-0"
              >
                <Globe className="h-2 w-2" />
              </Button>
            </div>
          </form>

          {/* Device Presets */}
          <div className="flex items-center space-x-1">
            {devicePresets.map((device) => (
              <Button
                key={device.name}
                variant={selectedDevice.name === device.name ? "default" : "ghost"}
                size="sm"
                className="h-6 px-2"
                onClick={() => setSelectedDevice(device)}
                title={`${device.name} (${device.width}x${device.height})`}
              >
                {device.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleViewMode}
            title={viewMode === 'preview' ? 'View Source' : 'View Preview'}
          >
            <Code className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
            title="Close viewer"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-2 py-1 text-xs ${
        theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs">
            <Zap className="h-2 w-2 mr-1" />
            Resource Optimized
          </Badge>
          
          <span className="text-gray-500">
            {selectedDevice.name}: {selectedDevice.width}x{selectedDevice.height}
          </span>
          
          {isLoading && (
            <span className="text-blue-400">Loading...</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">View: {viewMode}</span>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'preview' ? (
          <div 
            className="w-full h-full flex justify-center"
            style={{
              maxWidth: selectedDevice.width + 'px',
              margin: '0 auto',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
            }}
          >
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              style={{
                width: selectedDevice.width + 'px',
                height: '100%',
                transform: selectedDevice.width > (containerRef.current?.clientWidth || 0) 
                  ? `scale(${((containerRef.current?.clientWidth || 1000) - 40) / selectedDevice.width})` 
                  : 'scale(1)',
                transformOrigin: 'top left'
              }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
              loading="lazy"
              title="Web Viewer"
            />
          </div>
        ) : (
          <ScrollArea className="h-full">
            <pre className={`p-4 text-xs font-mono ${
              theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
              {sourceCode || 'No source code available'}
            </pre>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}