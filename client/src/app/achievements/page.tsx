"use client";

import { Button, Card } from "@/components/ui";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
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
              Achievements
            </h1>
            <p className="text-sm text-muted">Track your progress</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card
                variant={achievement.unlocked ? "glass" : "flat"}
                className={`p-4 text-center relative overflow-hidden ${!achievement.unlocked ? "opacity-60" : ""}`}
              >
                {achievement.unlocked && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                )}
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
                <h3 className="text-sm font-bold mb-0.5">{achievement.title}</h3>
                <p className="text-xs text-muted">{achievement.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
