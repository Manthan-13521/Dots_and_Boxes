"use client";

import { Button, Card, Switch } from "@/components/ui";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useTheme } from "@/providers";
import { useUIStore } from "@/stores/uiStore";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Music, Sparkles, Eye, Palette } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, resolvedTheme } = useTheme();
  const {
    soundEnabled, musicEnabled, animationsEnabled, colorBlindMode,
    toggleSound, toggleMusic, toggleAnimations, toggleColorBlind,
  } = useUIStore();

  const sections = [
    {
      title: "Appearance",
      items: [
        { icon: Palette, label: "Theme", control: <ThemeToggle />, description: `Current: ${theme} (${resolvedTheme})` },
        { icon: Eye, label: "Color Blind Mode", control: <Switch checked={colorBlindMode} onCheckedChange={toggleColorBlind} /> },
      ],
    },
    {
      title: "Audio",
      items: [
        { icon: Volume2, label: "Sound Effects", control: <Switch checked={soundEnabled} onCheckedChange={toggleSound} /> },
        { icon: Music, label: "Background Music", control: <Switch checked={musicEnabled} onCheckedChange={toggleMusic} /> },
      ],
    },
    {
      title: "Accessibility",
      items: [
        { icon: Sparkles, label: "Animations", control: <Switch checked={animationsEnabled} onCheckedChange={toggleAnimations} /> },
      ],
    },
  ];

  return (
    <main className="min-h-dvh flex flex-col p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto space-y-8"
      >
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <Card variant="glass" className="divide-y divide-border">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted" />
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      {"description" in item && (
                        <p className="text-xs text-muted">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">{item.control}</div>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </motion.div>
    </main>
  );
}
