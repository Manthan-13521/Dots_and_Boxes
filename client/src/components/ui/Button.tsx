"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-primary text-white hover:brightness-110 active:brightness-95 shadow-soft hover:shadow-elevated",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-elevated active:bg-surface",
  ghost:
    "text-foreground hover:bg-surface-elevated active:bg-surface",
  gradient:
    "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:opacity-80 shadow-soft hover:shadow-elevated",
  outline:
    "border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
  danger:
    "bg-error text-white hover:brightness-110 active:brightness-95",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  xl: "h-14 px-8 text-lg gap-3",
  icon: "h-10 w-10",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <motion.div
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn("inline-flex", disabled && "cursor-not-allowed")}
      >
        <Comp
          ref={ref}
          disabled={disabled || loading}
          className={cn(
            "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            variants[variant],
            sizes[size],
            className
          )}
          {...props}
        >
          {loading ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          {children}
        </Comp>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
