"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const cardVariants = {
  glass:
    "bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass hover:shadow-elevated transition-shadow duration-300",
  elevated:
    "bg-surface border border-border shadow-elevated",
  flat:
    "bg-surface border border-border",
  ghost:
    "bg-transparent",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass", interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-200",
          cardVariants[variant],
          interactive && "cursor-pointer hover:-translate-y-[2px] hover:shadow-elevated hover:border-primary/20 active:translate-y-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
