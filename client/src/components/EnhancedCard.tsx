
import { Card as BaseCard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface EnhancedCardProps extends React.ComponentProps<typeof BaseCard> {
  variant?: "default" | "glass" | "elevated";
  children: React.ReactNode;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "card-enhanced hover-lift",
      glass: "glass-dark hover-lift shadow-soft",
      elevated: "card-enhanced hover-lift shadow-elevated",
    };

    return (
      <BaseCard
        ref={ref}
        className={cn(
          "animate-fade-in",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </BaseCard>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = forwardRef<HTMLDivElement, React.ComponentProps<typeof CardHeader>>(
  ({ className, ...props }, ref) => (
    <CardHeader
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  )
);

EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = forwardRef<HTMLParagraphElement, React.ComponentProps<typeof CardTitle>>(
  ({ className, ...props }, ref) => (
    <CardTitle
      ref={ref}
      className={cn("text-heading text-xl text-dark-text mb-3", className)}
      {...props}
    />
  )
);

EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = forwardRef<HTMLParagraphElement, React.ComponentProps<typeof CardDescription>>(
  ({ className, ...props }, ref) => (
    <CardDescription
      ref={ref}
      className={cn("text-body", className)}
      {...props}
    />
  )
);

EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof CardContent>>(
  ({ className, ...props }, ref) => (
    <CardContent
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
);

EnhancedCardContent.displayName = "EnhancedCardContent";

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
};
