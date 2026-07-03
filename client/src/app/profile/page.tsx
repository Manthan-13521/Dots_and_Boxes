"use client";

import { Button, Card, Avatar } from "@/components/ui";
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
    <main className="min-h-dvh flex flex-col p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto space-y-6"
      >
        <Card variant="glass" className="flex items-center gap-4">
          <Avatar name="Player" size="lg" />
          <div>
            <h2 className="text-lg font-semibold">Player</h2>
            <p className="text-sm text-muted">No games played yet</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} variant="flat" className="p-4 text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card variant="glass" className="p-6 text-center">
          <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">No Achievements Yet</h3>
          <p className="text-sm text-muted">Play your first game to start earning achievements</p>
        </Card>
      </motion.div>
    </main>
  );
}
