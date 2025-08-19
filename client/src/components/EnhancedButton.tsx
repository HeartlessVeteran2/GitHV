import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  loading?: boolean;
  ripple?: boolean;
  glow?: boolean;
  bounce?: boolean;
  iconOnly?: boolean;
}

export default function EnhancedButton({
  className,
  variant = 'default',
  size = 'default',
  children,
  loading = false,
  ripple = true,
  glow = false,
  bounce = false,
  iconOnly = false,
  onClick,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRippleCoords({ x, y });
      
      setTimeout(() => setRippleCoords(null), 600);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick(e);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'btn-primary-interactive';
      case 'outline':
      case 'secondary':
        return 'btn-secondary-interactive';
      case 'ghost':
        return 'btn-ghost-interactive';
      default:
        return 'btn-interactive';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        getVariantClasses(),
        ripple && 'ripple-effect',
        glow && 'hover:shadow-lg',
        bounce && 'hover:animate-bounce',
        iconOnly && 'icon-btn-interactive',
        isPressed && 'scale-95',
        loading && 'opacity-70 pointer-events-none',
        className
      )}
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spinner-enhanced" />
        </div>
      )}
      
      {children}
      
      {ripple && rippleCoords && (
        <span
          className="absolute pointer-events-none bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: rippleCoords.x,
            top: rippleCoords.y,
            width: '10px',
            height: '10px',
            animationDuration: '600ms',
          }}
        />
      )}
    </Button>
  );
}