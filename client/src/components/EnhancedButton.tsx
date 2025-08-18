
import { Button as BaseButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface EnhancedButtonProps extends React.ComponentProps<typeof BaseButton> {
  variant?: "primary" | "secondary" | "ghost" | "glow";
  children: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variantClasses = {
      primary: "btn-primary hover-lift shadow-soft",
      secondary: "btn-secondary hover-lift",
      ghost: "hover:bg-dark-surface/50 hover-lift",
      glow: "btn-primary hover-glow animate-glow",
    };

    return (
      <BaseButton
        ref={ref}
        className={cn(
          "transition-all duration-300 focus-enhanced",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
