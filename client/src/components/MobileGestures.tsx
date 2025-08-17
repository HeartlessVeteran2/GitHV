import { useEffect, useRef, useState } from "react";

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'longpress' | 'doubletap';
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  target?: HTMLElement;
}

interface MobileGesturesProps {
  onGesture: (gesture: TouchGesture) => void;
  children: React.ReactNode;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
}

export default function MobileGestures({
  onGesture,
  children,
  enableSwipe = true,
  enablePinch = true,
  enableLongPress = true,
  enableDoubleTap = true
}: MobileGesturesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);

  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();

    if (e.touches.length === 1) {
      // Single touch
      setTouchStart({ x: touch.clientX, y: touch.clientY, time: now });

      // Long press detection
      if (enableLongPress) {
        const timer = setTimeout(() => {
          onGesture({
            type: 'longpress',
            target: e.target as HTMLElement
          });
        }, 500);
        setLongPressTimer(timer);
      }

      // Double tap detection
      if (enableDoubleTap) {
        const timeDiff = now - lastTap;
        if (timeDiff < 300) {
          onGesture({
            type: 'doubletap',
            target: e.target as HTMLElement
          });
        }
        setLastTap(now);
      }
    } else if (e.touches.length === 2 && enablePinch) {
      // Pinch gesture start
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setCurrentScale(1);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (e.touches.length === 2 && enablePinch && initialPinchDistance > 0) {
      // Pinch gesture
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialPinchDistance;
      setCurrentScale(scale);
      
      onGesture({
        type: 'pinch',
        scale: scale
      });
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (touchStart && e.changedTouches.length === 1 && enableSwipe) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;

      // Only consider as swipe if movement is significant and fast enough
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (deltaTime < maxSwipeTime) {
          let direction: 'up' | 'down' | 'left' | 'right';
          
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
          } else {
            direction = deltaY > 0 ? 'down' : 'up';
          }

          onGesture({
            type: 'swipe',
            direction: direction
          });
        }
      }
    }

    // Reset state
    setTouchStart(null);
    setInitialPinchDistance(0);
    setCurrentScale(1);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent default touch behaviors that might interfere
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchmove', preventDefault);
    };
  }, [touchStart, longPressTimer, initialPinchDistance, lastTap]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
}

// Hook for easy gesture handling
export function useMobileGestures(onGesture: (gesture: TouchGesture) => void) {
  const gestureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = gestureRef.current;
    if (!element) return;

    let touchStart: { x: number; y: number; time: number } | null = null;
    let lastTap = 0;
    let longPressTimer: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      touchStart = { x: touch.clientX, y: touch.clientY, time: now };

      // Long press
      longPressTimer = setTimeout(() => {
        onGesture({ type: 'longpress', target: e.target as HTMLElement });
      }, 500);

      // Double tap
      const timeDiff = now - lastTap;
      if (timeDiff < 300) {
        onGesture({ type: 'doubletap', target: e.target as HTMLElement });
      }
      lastTap = now;
    };

    const handleTouchMove = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (touchStart && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        const deltaTime = Date.now() - touchStart.time;

        if ((Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) && deltaTime < 300) {
          const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up');
          
          onGesture({ type: 'swipe', direction });
        }
      }

      touchStart = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [onGesture]);

  return gestureRef;
}