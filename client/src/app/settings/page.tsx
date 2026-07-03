"use client";

import { Button, Card, Switch } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
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
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 flex-1 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-8 max-w-lg mx-auto w-full">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-neon bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-sm text-muted">Customize your experience</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg mx-auto space-y-8"
        >
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: si * 0.1 }}
            >
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest mb-3">
                {section.title}
              </h2>
              <Card variant="glass" className="divide-y divide-glass-border relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted" />
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        {"description" in item && (
                          <p className="text-xs text-muted mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">{item.control}</div>
                  </div>
                ))}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
