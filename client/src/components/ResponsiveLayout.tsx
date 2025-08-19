import { useState, useEffect, lazy, Suspense } from 'react';
import { useDeviceDetection, getDeviceClasses } from '@/hooks/use-device-detection';
import { cn } from '@/lib/utils';
import { performanceTracker } from '@/lib/performance';

// Phone Layout Components
import SimpleMobileDropdowns from './SimpleMobileDropdowns';
import MobileFileManager from './MobileFileManager';

// Tablet Layout Components  
import ImprovedAndroidStudioLayout from './ImprovedAndroidStudioLayout';

// Desktop Layout Components
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Header from './Header';
import Sidebar from './Sidebar';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';
import CopilotAssistant from './CopilotAssistant';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
  onLogin: () => void;
}

export default function ResponsiveLayout({ children, onLogin }: ResponsiveLayoutProps) {
  const { deviceInfo, isPhone, isTablet, isDesktop } = useDeviceDetection();
  const [layoutState, setLayoutState] = useState({
    sidebarVisible: !isPhone,
    terminalVisible: !isPhone,
    aiPanelVisible: true,
    currentFile: null as any,
    zoomLevel: isPhone ? 120 : 100,
    fullscreen: false
  });

  // Performance tracking for layout changes
  useEffect(() => {
    performanceTracker.start('layout-render');
    return () => {
      performanceTracker.end('layout-render');
    };
  }, [deviceInfo.type]);

  // Auto-adjust layout based on device type changes
  useEffect(() => {
    setLayoutState(prev => ({
      ...prev,
      sidebarVisible: !isPhone,
      terminalVisible: !isPhone && !isTablet,
      zoomLevel: isPhone ? 120 : isTablet ? 110 : 100
    }));
  }, [isPhone, isTablet, isDesktop]);

  // Silent autosave functionality (runs in background without UI)
  useEffect(() => {
    if (isPhone && layoutState.currentFile) {
      const interval = setInterval(() => {
        handleAction('auto-save');
      }, 30000); // Auto-save every 30 seconds on mobile
      
      return () => clearInterval(interval);
    }
  }, [isPhone, layoutState.currentFile]);

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'toggle-sidebar':
        setLayoutState(prev => ({ ...prev, sidebarVisible: !prev.sidebarVisible }));
        break;
      case 'toggle-terminal':
        setLayoutState(prev => ({ ...prev, terminalVisible: !prev.terminalVisible }));
        break;
      case 'toggle-ai':
        setLayoutState(prev => ({ ...prev, aiPanelVisible: !prev.aiPanelVisible }));
        break;
      case 'zoom-in':
        setLayoutState(prev => ({ ...prev, zoomLevel: Math.min(prev.zoomLevel + 10, 200) }));
        break;
      case 'zoom-out':
        setLayoutState(prev => ({ ...prev, zoomLevel: Math.max(prev.zoomLevel - 10, 50) }));
        break;
      case 'fullscreen':
        setLayoutState(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
        break;
      case 'open-file':
        setLayoutState(prev => ({ ...prev, currentFile: data }));
        break;
      case 'auto-save':
        // Silent autosave functionality preserved but hidden from UI
        console.log('Auto-saving in background...');
        break;
      default:
        console.log('Action:', action, data);
    }
  };

  // Add device-specific CSS classes to body
  useEffect(() => {
    const classes = getDeviceClasses(deviceInfo);
    document.body.className = cn(document.body.className, classes);
    
    // Set CSS custom properties for responsive design
    document.documentElement.style.setProperty('--zoom-level', `${layoutState.zoomLevel}%`);
    document.documentElement.style.setProperty('--device-width', `${deviceInfo.screenWidth}px`);
    document.documentElement.style.setProperty('--device-height', `${deviceInfo.screenHeight}px`);
    
    return () => {
      document.body.className = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('device-') && !cls.startsWith('orientation-'))
        .join(' ');
    };
  }, [deviceInfo, layoutState.zoomLevel]);

  // Phone Layout (< 768px)
  if (isPhone) {
    return (
      <div className={cn(
        "min-h-screen bg-dark-bg text-dark-text overflow-hidden",
        "phone-layout touch-optimized"
      )}>
        {/* Mobile Header with Dropdowns */}
        <div className="safe-area-top">
          <SimpleMobileDropdowns
            onAction={handleAction}
            currentFile={layoutState.currentFile}
            repositoryFiles={[]}
            isFileTreeOpen={layoutState.sidebarVisible}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Mobile File Manager (Overlay) */}
          {layoutState.sidebarVisible && (
            <MobileFileManager
              files={[]}
              onFileSelect={(file) => handleAction('open-file', file)}
              onFileAction={handleAction}
              recentFiles={[]}
              starredFiles={[]}
            />
          )}

          {/* Code Editor */}
          <div className="h-full" style={{ fontSize: `${layoutState.zoomLevel}%` }}>
            <CodeEditor
              openFiles={layoutState.currentFile ? [layoutState.currentFile] : []}
              activeFileId={layoutState.currentFile?.id || null}
              onFileClose={() => handleAction('close-file')}
              onFileChange={(fileId, content) => handleAction('file-change', { fileId, content })}
              onActiveFileChange={(fileId) => handleAction('active-file-change', fileId)}
              onSave={() => handleAction('save')}
              onRun={() => handleAction('run')}
            />
          </div>

        </div>
      </div>
    );
  }

  // Tablet Layout (768px - 1024px)
  if (isTablet) {
    return (
      <div className={cn(
        "min-h-screen bg-dark-bg text-dark-text",
        "tablet-layout"
      )}>
        <ImprovedAndroidStudioLayout onLogin={onLogin} />
      </div>
    );
  }

  // Desktop Layout (> 1024px)
  return (
    <div className={cn(
      "min-h-screen bg-dark-bg text-dark-text",
      "desktop-layout"
    )}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header
          onToggleSidebar={() => handleAction('toggle-sidebar')}
          onPush={() => handleAction('push')}
          onSync={() => handleAction('sync')}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Sidebar */}
            {layoutState.sidebarVisible && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <Sidebar
                    currentRepository={null}
                    onFileSelect={(file) => handleAction('open-file', file)}
                    selectedFileId={layoutState.currentFile?.id}
                  />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* Editor Area */}
            <ResizablePanel defaultSize={layoutState.aiPanelVisible ? 50 : 70}>
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor */}
                <ResizablePanel defaultSize={layoutState.terminalVisible ? 70 : 100}>
                  <CodeEditor
                    openFiles={layoutState.currentFile ? [layoutState.currentFile] : []}
                    activeFileId={layoutState.currentFile?.id || null}
                    onFileClose={() => handleAction('close-file')}
                    onFileChange={(fileId, content) => handleAction('file-change', { fileId, content })}
                    onActiveFileChange={(fileId) => handleAction('active-file-change', fileId)}
                    onSave={() => handleAction('save')}
                    onRun={() => handleAction('run')}
                  />
                </ResizablePanel>

                {/* Terminal */}
                {layoutState.terminalVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={30} minSize={20}>
                      <Terminal 
                        isOpen={layoutState.terminalVisible}
                        onClose={() => handleAction('toggle-terminal')}
                        theme="dark"
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* AI Assistant Panel */}
            {layoutState.aiPanelVisible && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                  <CopilotAssistant
                    code=""
                    language="typescript"
                    fileName={layoutState.currentFile?.path || "untitled.ts"}
                    onCodeChange={(code) => handleAction('code-change', code)}
                    onInsertCode={(code, position) => handleAction('insert-code', { code, position })}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}