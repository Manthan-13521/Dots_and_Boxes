"use client";

import { Button, Card } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { motion } from "framer-motion";
import { Gamepad2, Users, Bot, Globe, Settings, Trophy, Sparkles, Square } from "lucide-react";
import Link from "next/link";

const modes = [
  { icon: Users, title: "Local Multiplayer", description: "Play with a friend on the same device", href: "/game/local?mode=2p", color: "from-blue-500 to-cyan-500" },
  { icon: Bot, title: "vs AI", description: "Challenge the computer at any difficulty", href: "/game/local?mode=ai", color: "from-purple-500 to-pink-500" },
  { icon: Globe, title: "Online", description: "Battle players from around the world", href: "/game/online", color: "from-cyan-500 to-teal-500" },
  { icon: Gamepad2, title: "Practice", description: "Play alone and learn the game", href: "/game/local?mode=solo", color: "from-orange-500 to-red-500" },
];

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-glass-border bg-glass-bg backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Square className="h-5 w-5 text-primary relative z-10" />
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-neon bg-clip-text text-transparent">
            Dots & Boxes
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="flex items-center gap-1"
        >
          <Link href="/achievements">
            <Button variant="ghost" size="icon" aria-label="Achievements">
              <Trophy className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
        </motion.div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary via-cyan-neon to-secondary p-[2px] shadow-glow">
                  <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-background flex items-center justify-center">
                    <Square className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4"
            >
              <span className="bg-gradient-to-r from-primary via-cyan-neon to-secondary bg-clip-text text-transparent">
                Dots & Boxes
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl text-muted max-w-lg mx-auto leading-relaxed"
            >
              A classic game reimagined. Beautiful, competitive, and incredibly smooth.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {modes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={mode.href}>
                  <Card variant="glass" interactive className="group flex flex-col items-center text-center p-6 h-full relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${mode.color} blur-3xl`} />
                    <mode.icon className="h-8 w-8 text-primary mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-bold mb-1 relative z-10">{mode.title}</h3>
                    <p className="text-sm text-muted relative z-10">{mode.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center gap-3 flex-wrap"
          >
            <Link href="/game/local?mode=ai">
              <Button variant="gradient" size="xl">
                <Sparkles className="h-5 w-5" />
                Quick Match
              </Button>
            </Link>
            <Link href="/game/online">
              <Button variant="outline" size="xl">
                <Globe className="h-5 w-5" />
                Create Room
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
