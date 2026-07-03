"use client";

import { Button, Card } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { motion } from "framer-motion";
import { Gamepad2, Users, Bot, Globe, Settings, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
} as const;

const modes = [
  { icon: Users, title: "Local Multiplayer", description: "Play with a friend on the same device", href: "/game/local?mode=2p" },
  { icon: Bot, title: "vs AI", description: "Challenge the computer at any difficulty", href: "/game/local?mode=ai" },
  { icon: Globe, title: "Online", description: "Battle players from around the world", href: "/game/online" },
  { icon: Gamepad2, title: "Practice", description: "Play alone and learn the game", href: "/game/local?mode=solo" },
];

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col relative">
      <AnimatedBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Dots & Boxes</h1>
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
              Dots & Boxes
            </h2>
            <p className="text-lg text-muted max-w-md mx-auto">
              A classic game reimagined. Beautiful, minimal, and incredibly smooth.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {modes.map((mode) => (
              <Link key={mode.title} href={mode.href}>
                <Card variant="glass" interactive className="flex flex-col items-center text-center p-6 h-full">
                  <mode.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{mode.title}</h3>
                  <p className="text-sm text-muted">{mode.description}</p>
                </Card>
              </Link>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center gap-3 flex-wrap">
            <Link href="/game/local?mode=ai">
              <Button variant="gradient" size="lg">
                Quick Match
              </Button>
            </Link>
            <Link href="/game/online">
              <Button variant="secondary" size="lg">
                Create Room
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
