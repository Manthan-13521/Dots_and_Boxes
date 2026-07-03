"use client";

import { useTheme } from "@/providers";
import { Button } from "@/components/ui";
import { Sun, Moon, Monitor } from "lucide-react";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];
  const next: Record<string, "light" | "dark" | "system"> = {
    light: "dark",
    dark: "system",
    system: "light",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next[theme])}
      aria-label={`Current theme: ${theme}. Click to switch to ${next[theme]}.`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
