"use client";

import { Button, Card } from "@/components/ui";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Award, Zap, Target, Brain, Flame, Star } from "lucide-react";
import Link from "next/link";

const achievements = [
  { icon: Award, title: "First Step", description: "Play your first game", unlocked: false },
  { icon: Star, title: "Victor", description: "Win your first game", unlocked: false },
  { icon: Zap, title: "Speed Demon", description: "Win in under 10 moves", unlocked: false },
  { icon: Target, title: "Perfect Game", description: "Win without opponent capturing a box", unlocked: false },
  { icon: Brain, title: "Grandmaster", description: "Win against Impossible AI", unlocked: false },
  { icon: Flame, title: "Hot Streak", description: "Win 5 games in a row", unlocked: false },
];

export default function AchievementsPage() {
  return (
    <main className="min-h-dvh flex flex-col p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Achievements</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {achievements.map((achievement) => (
          <Card
            key={achievement.title}
            variant={achievement.unlocked ? "glass" : "flat"}
            className={`p-4 text-center ${!achievement.unlocked ? "opacity-50" : ""}`}
          >
            <div className="relative inline-block mb-2">
              {achievement.unlocked ? (
                <achievement.icon className="h-8 w-8 text-primary" />
              ) : (
                <div className="relative">
                  <achievement.icon className="h-8 w-8 text-muted" />
                  <Lock className="h-3 w-3 absolute -bottom-1 -right-1 text-muted" />
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-0.5">{achievement.title}</h3>
            <p className="text-xs text-muted">{achievement.description}</p>
          </Card>
        ))}
      </motion.div>
    </main>
  );
}
