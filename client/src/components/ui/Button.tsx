"use client";

import { forwardRef, useCallback, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-gradient-to-b from-primary to-primary-dark text-white shadow-soft hover:shadow-glow active:shadow-soft border border-primary-light/20",
  secondary:
    "bg-surface text-foreground border border-border hover:border-primary/30 hover:bg-surface-elevated active:bg-surface",
  ghost:
    "text-foreground hover:bg-surface-elevated hover:text-primary active:bg-surface",
  gradient:
    "bg-gradient-to-r from-primary via-cyan-neon to-secondary text-white shadow-soft hover:shadow-glow-cyan active:shadow-soft border border-white/10",
  outline:
    "border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/15 shadow-soft hover:shadow-glow",
  danger:
    "bg-gradient-to-b from-error to-red-700 text-white shadow-soft hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:shadow-soft",
};

const sizes = {
  sm: "h-8 px-4 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-8 text-base gap-2.5 rounded-xl",
  xl: "h-14 px-10 text-lg gap-3 rounded-2xl",
  icon: "h-10 w-10 rounded-xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading = false, disabled, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const ripplesRef = useRef<{ x: number; y: number; id: number }[]>([]);
    const rippleIdRef = useRef(0);

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;
      ripplesRef.current.push({ x, y, id });
      setTimeout(() => {
        ripplesRef.current = ripplesRef.current.filter((r) => r.id !== id);
        const el = btnRef.current;
        if (el) {
          el.style.setProperty("--ripple-x", "0px");
          el.style.setProperty("--ripple-y", "0px");
        }
      }, 600);
      onClick?.(e);
    }, [disabled, loading, onClick]);

    return (
      <Comp
        ref={(node) => {
          btnRef.current = node as HTMLButtonElement;
          if (typeof ref === "function") ref(node as HTMLButtonElement);
          else if (ref) ref.current = node;
        }}
        disabled={disabled || loading}
        className={cn(
          "relative overflow-hidden inline-flex items-center justify-center font-semibold",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:translate-y-[-1px] active:translate-y-[0px]",
          variants[variant],
          sizes[size],
          className
        )}
        onClick={handleClick}
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
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
