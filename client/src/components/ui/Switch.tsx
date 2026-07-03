"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, id, label, className }, ref) => {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <SwitchPrimitive.Root
          ref={ref}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          id={id}
          className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary" : "bg-border"
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-soft ring-0 transition-transform duration-200",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </SwitchPrimitive.Root>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
