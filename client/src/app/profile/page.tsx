"use client";

import { Button, Card, Avatar } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Gamepad2, TrendingUp, Zap, Target } from "lucide-react";
import Link from "next/link";

const stats = [
  { icon: Gamepad2, label: "Games Played", value: "0" },
  { icon: Trophy, label: "Wins", value: "0" },
  { icon: TrendingUp, label: "Win Rate", value: "0%" },
  { icon: Zap, label: "Best Streak", value: "0" },
  { icon: Target, label: "Boxes Captured", value: "0" },
];

export default function ProfilePage() {
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
              Profile
            </h1>
            <p className="text-sm text-muted">Your gaming stats</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg mx-auto space-y-6"
        >
          <Card variant="glass" className="flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <Avatar name="Player" size="lg" />
            <div>
              <h2 className="text-lg font-bold">Player</h2>
              <p className="text-sm text-muted">No games played yet</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card variant="flat" className="p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card variant="glass" className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-1">No Achievements Yet</h3>
            <p className="text-sm text-muted">Play your first game to start earning achievements</p>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
